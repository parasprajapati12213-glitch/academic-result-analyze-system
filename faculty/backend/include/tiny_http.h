// tiny_http.h — Minimal single-file HTTP/1.1 server for Windows (Winsock2)
// Compatible with GCC 6+ / MinGW. No OpenSSL needed.
// Supports: GET, POST, PUT, DELETE, OPTIONS
// Serves static files AND API routes.

#pragma once
#ifndef TINY_HTTP_H
#define TINY_HTTP_H

#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>
#include <string>
#include <map>
#include <functional>
#include <vector>
#include <sstream>
#include <fstream>
#include <iostream>
#include <algorithm>

#pragma comment(lib, "ws2_32.lib")

namespace thttp {

struct Request {
    std::string method;
    std::string path;
    std::string query;
    std::string body;
    std::map<std::string, std::string> headers;
    std::map<std::string, std::string> params;   // path params like :id
    std::map<std::string, std::string> queryParams;
};

struct Response {
    int status = 200;
    std::string body;
    std::string contentType = "application/json";
    std::map<std::string, std::string> headers;

    void set(const std::string& b, const std::string& ct = "application/json") {
        body = b; contentType = ct;
    }
};

using Handler = std::function<void(const Request&, Response&)>;

struct Route {
    std::string method;
    std::string pattern;    // e.g. "/api/students/:id"
    Handler     handler;
};

// Match pattern like "/api/students/:id" against path "/api/students/abc123"
// Returns true and fills params map
static bool matchRoute(const std::string& pattern, const std::string& path,
                       std::map<std::string, std::string>& params)
{
    std::vector<std::string> pParts, rParts;
    auto split = [](const std::string& s, char delim) {
        std::vector<std::string> v;
        std::stringstream ss(s);
        std::string tok;
        while (std::getline(ss, tok, delim))
            if (!tok.empty()) v.push_back(tok);
        return v;
    };
    pParts = split(pattern, '/');
    rParts = split(path, '/');
    if (pParts.size() != rParts.size()) return false;
    params.clear();
    for (size_t i = 0; i < pParts.size(); i++) {
        if (!pParts[i].empty() && pParts[i][0] == ':')
            params[pParts[i].substr(1)] = rParts[i];
        else if (pParts[i] != rParts[i])
            return false;
    }
    return true;
}

static std::string urlDecode(const std::string& s) {
    std::string out;
    for (size_t i = 0; i < s.size(); ++i) {
        if (s[i] == '%' && i + 2 < s.size()) {
            int c; sscanf(s.c_str() + i + 1, "%2x", &c);
            out += (char)c; i += 2;
        } else if (s[i] == '+') {
            out += ' ';
        } else {
            out += s[i];
        }
    }
    return out;
}

static std::map<std::string,std::string> parseQuery(const std::string& q) {
    std::map<std::string,std::string> m;
    std::stringstream ss(q);
    std::string pair;
    while (std::getline(ss, pair, '&')) {
        auto eq = pair.find('=');
        if (eq != std::string::npos)
            m[urlDecode(pair.substr(0, eq))] = urlDecode(pair.substr(eq + 1));
    }
    return m;
}

static std::string mimeType(const std::string& path) {
    auto ext = path.rfind('.');
    if (ext == std::string::npos) return "text/plain";
    std::string e = path.substr(ext);
    if (e == ".html" || e == ".htm") return "text/html";
    if (e == ".css")  return "text/css";
    if (e == ".js")   return "application/javascript";
    if (e == ".json") return "application/json";
    if (e == ".png")  return "image/png";
    if (e == ".jpg" || e == ".jpeg") return "image/jpeg";
    if (e == ".webp") return "image/webp";
    if (e == ".ico")  return "image/x-icon";
    if (e == ".svg")  return "image/svg+xml";
    return "text/plain";
}

static std::string statusText(int code) {
    switch(code) {
        case 200: return "OK";
        case 201: return "Created";
        case 204: return "No Content";
        case 400: return "Bad Request";
        case 404: return "Not Found";
        case 409: return "Conflict";
        case 500: return "Internal Server Error";
        default:  return "Unknown";
    }
}

class Server {
public:
    std::string staticRoot;

    void Get   (const std::string& p, Handler h) { routes_.push_back({"GET",    p, h}); }
    void Post  (const std::string& p, Handler h) { routes_.push_back({"POST",   p, h}); }
    void Put   (const std::string& p, Handler h) { routes_.push_back({"PUT",    p, h}); }
    void Delete(const std::string& p, Handler h) { routes_.push_back({"DELETE", p, h}); }
    void Options(const std::string& p, Handler h){ routes_.push_back({"OPTIONS",p, h}); }

    Server() { InitializeCriticalSection(&cs_); }
    ~Server() { DeleteCriticalSection(&cs_); }

    bool listen(const std::string& host, int port) {
        WSADATA wd;
        if (WSAStartup(MAKEWORD(2,2), &wd) != 0) { std::cerr << "WSAStartup failed\n"; return false; }
        SOCKET srv = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (srv == INVALID_SOCKET) { std::cerr << "socket() failed\n"; return false; }
        int opt = 1;
        setsockopt(srv, SOL_SOCKET, SO_REUSEADDR, (char*)&opt, sizeof(opt));

        sockaddr_in addr;
        memset(&addr, 0, sizeof(addr));
        addr.sin_family      = AF_INET;
        addr.sin_port        = htons(port);
        addr.sin_addr.s_addr = inet_addr(host.c_str());

        if (bind(srv, (sockaddr*)&addr, sizeof(addr)) != 0) {
            std::cerr << "bind() failed on port " << port << "\n";
            closesocket(srv); return false;
        }
        if (::listen(srv, 128) != 0) {
            std::cerr << "listen() failed\n"; closesocket(srv); return false;
        }

        std::cout << "[server] Listening on http://" << host << ":" << port << "\n";

        while (true) {
            SOCKET client = accept(srv, nullptr, nullptr);
            if (client == INVALID_SOCKET) continue;
            // Allocate a struct to pass both server pointer and socket to thread
            ClientArgs* args = new ClientArgs{this, client};
            HANDLE t = CreateThread(nullptr, 0, threadEntry, args, 0, nullptr);
            if (t) CloseHandle(t); // detach
        }
        WSACleanup();
        return true;
    }

private:
    std::vector<Route> routes_;
    CRITICAL_SECTION   cs_;

    struct ClientArgs { Server* svr; SOCKET client; };

    static DWORD WINAPI threadEntry(LPVOID arg) {
        ClientArgs* a = (ClientArgs*)arg;
        a->svr->handleClient(a->client);
        delete a;
        return 0;
    }

    void handleClient(SOCKET client) {
        // Read request
        std::string raw;
        char buf[4096];
        int n;
        // Read headers
        while (true) {
            n = recv(client, buf, sizeof(buf)-1, 0);
            if (n <= 0) { closesocket(client); return; }
            buf[n] = 0;
            raw += buf;
            if (raw.find("\r\n\r\n") != std::string::npos) break;
        }

        // Parse request line
        std::istringstream stream(raw);
        std::string reqLine;
        std::getline(stream, reqLine);
        if (!reqLine.empty() && reqLine.back() == '\r') reqLine.pop_back();

        std::istringstream rl(reqLine);
        Request req;
        std::string fullPath;
        rl >> req.method >> fullPath;

        // Split path and query
        auto qpos = fullPath.find('?');
        if (qpos != std::string::npos) {
            req.path  = fullPath.substr(0, qpos);
            req.query = fullPath.substr(qpos + 1);
        } else {
            req.path  = fullPath;
        }
        req.queryParams = parseQuery(req.query);

        // Parse headers
        int contentLength = 0;
        std::string line;
        while (std::getline(stream, line)) {
            if (!line.empty() && line.back() == '\r') line.pop_back();
            if (line.empty()) break;
            auto col = line.find(':');
            if (col != std::string::npos) {
                std::string key = line.substr(0, col);
                std::string val = line.substr(col+2); // skip ': '
                // lowercase key for easy lookup
                std::transform(key.begin(), key.end(), key.begin(), ::tolower);
                req.headers[key] = val;
                if (key == "content-length") contentLength = std::stoi(val);
            }
        }

        // Parse body
        // Body may already be partially in raw, or we need to read more
        auto hdrEnd = raw.find("\r\n\r\n");
        if (hdrEnd != std::string::npos) {
            std::string bodyPart = raw.substr(hdrEnd + 4);
            while ((int)bodyPart.size() < contentLength) {
                n = recv(client, buf, sizeof(buf)-1, 0);
                if (n <= 0) break;
                buf[n] = 0;
                bodyPart += buf;
            }
            req.body = bodyPart.substr(0, contentLength);
        }

        Response res;
        bool handled = false;

        // CORS preflight
        if (req.method == "OPTIONS") {
            res.status = 204;
            res.body   = "";
            sendResponse(client, res);
            closesocket(client);
            return;
        }

        // Try API routes
        for (auto& route : routes_) {
            if (route.method != req.method) continue;
            std::map<std::string,std::string> params;
            if (matchRoute(route.pattern, req.path, params)) {
                req.params = params;
                EnterCriticalSection(&cs_);
                route.handler(req, res);
                LeaveCriticalSection(&cs_);
                handled = true;
                break;
            }
        }

        // Serve static files if not handled by API
        if (!handled && !staticRoot.empty()) {
            std::string filePath = req.path;
            if (filePath == "/" || filePath.empty()) filePath = "/index.html";
            std::string fullFilePath = staticRoot + filePath;
            // Normalize path separators
            std::replace(fullFilePath.begin(), fullFilePath.end(), '/', '\\');
            std::ifstream f(fullFilePath, std::ios::binary);
            if (f.is_open()) {
                std::string content((std::istreambuf_iterator<char>(f)),
                                     std::istreambuf_iterator<char>());
                res.status      = 200;
                res.contentType = mimeType(filePath);
                res.body        = content;
                handled = true;
            } else {
                res.status = 404;
                res.contentType = "text/html";
                res.body   = "<h1>404 Not Found</h1>";
            }
        }

        if (!handled) {
            res.status = 404;
            res.body   = "{\"error\":\"Not found\"}";
        }

        sendResponse(client, res);
        closesocket(client);
    }

    void sendResponse(SOCKET client, const Response& res) {
        std::ostringstream oss;
        oss << "HTTP/1.1 " << res.status << " " << statusText(res.status) << "\r\n";
        if (res.contentType.find("image/") != std::string::npos) {
            oss << "Content-Type: " << res.contentType << "\r\n";
        } else {
            oss << "Content-Type: " << res.contentType << "; charset=utf-8\r\n";
        }
        oss << "Content-Length: " << res.body.size() << "\r\n";
        oss << "Access-Control-Allow-Origin: *\r\n";
        oss << "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS\r\n";
        oss << "Access-Control-Allow-Headers: Content-Type, Authorization\r\n";
        oss << "Connection: close\r\n";
        for (auto& kv : res.headers) oss << kv.first << ": " << kv.second << "\r\n";
        oss << "\r\n";
        std::string hdr = oss.str();
        send(client, hdr.data(), (int)hdr.size(), 0);
        if (!res.body.empty()) {
            send(client, res.body.data(), (int)res.body.size(), 0);
        }
    }
};

} // namespace thttp

#endif // TINY_HTTP_H
