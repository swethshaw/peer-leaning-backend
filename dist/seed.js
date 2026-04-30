"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = __importDefault(require("./config/db"));
const Question_1 = __importDefault(require("./models/Question"));
const topicId = new mongoose_1.default.Types.ObjectId("69aed4b90d363fac83774c20");
const questions = [
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "What does HTTP stand for?",
        options: [
            "HyperText Transfer Protocol",
            "High Transfer Text Protocol",
            "Hyper Transfer Text Process",
            "Host Transfer Protocol"
        ],
        correctAnswerIndex: 0,
        explanation: "HTTP is the protocol used by web browsers and servers to communicate and transfer web pages."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "Which device connects your local network to the Internet?",
        options: ["Router", "Keyboard", "Monitor", "Printer"],
        correctAnswerIndex: 0,
        explanation: "A router directs network traffic between devices and the internet."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "What does URL stand for?",
        options: [
            "Uniform Resource Locator",
            "Universal Resource Link",
            "Unified Routing Link",
            "Uniform Retrieval Location"
        ],
        correctAnswerIndex: 0,
        explanation: "A URL is the address used to access resources on the internet."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "Which protocol is primarily used to load web pages?",
        options: ["HTTP", "FTP", "SMTP", "SSH"],
        correctAnswerIndex: 0,
        explanation: "HTTP is the primary protocol used to transfer web pages between clients and servers."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "What does ISP stand for?",
        options: [
            "Internet Service Provider",
            "Internet System Program",
            "Internal Service Provider",
            "Internet Security Protocol"
        ],
        correctAnswerIndex: 0,
        explanation: "An ISP provides internet connectivity to individuals and organizations."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "Which component translates domain names into IP addresses?",
        options: ["DNS", "HTTP", "FTP", "SMTP"],
        correctAnswerIndex: 0,
        explanation: "DNS converts human-readable domain names into machine-readable IP addresses."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "What is an IP address used for?",
        options: [
            "Identifying devices on a network",
            "Encrypting passwords",
            "Designing web pages",
            "Creating databases"
        ],
        correctAnswerIndex: 0,
        explanation: "An IP address uniquely identifies devices connected to a network."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "Which company manages domain name registration globally?",
        options: ["ICANN", "Google", "Microsoft", "IBM"],
        correctAnswerIndex: 0,
        explanation: "ICANN coordinates global internet domain names and IP address allocation."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "Which protocol sends emails?",
        options: ["SMTP", "HTTP", "DNS", "FTP"],
        correctAnswerIndex: 0,
        explanation: "SMTP (Simple Mail Transfer Protocol) is used to send email messages."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "Which device stores website files?",
        options: ["Web Server", "Router", "Switch", "Firewall"],
        correctAnswerIndex: 0,
        explanation: "A web server stores and delivers website files to users' browsers."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "Which of the following is a web browser?",
        options: ["Google Chrome", "Linux", "Node.js", "MySQL"],
        correctAnswerIndex: 0,
        explanation: "Google Chrome is a browser used to access websites."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "What is the main function of DNS?",
        options: [
            "Convert domain names to IP addresses",
            "Transfer files",
            "Send emails",
            "Encrypt data"
        ],
        correctAnswerIndex: 0,
        explanation: "DNS helps locate servers by translating domain names into IP addresses."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "Which part of a URL indicates the protocol?",
        options: ["https://", ".com", "www", "domain name"],
        correctAnswerIndex: 0,
        explanation: "The protocol portion like https:// indicates how data should be transferred."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "What is the Internet?",
        options: [
            "A global network of connected computers",
            "A single computer server",
            "A mobile application",
            "A programming language"
        ],
        correctAnswerIndex: 0,
        explanation: "The internet is a worldwide network connecting millions of devices."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Easy",
        question: "Which protocol is secure version of HTTP?",
        options: ["HTTPS", "FTP", "SMTP", "TCP"],
        correctAnswerIndex: 0,
        explanation: "HTTPS adds encryption using SSL/TLS to HTTP communication."
    },
    // INTERMEDIATE (15)
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "What happens first when you type a URL in a browser?",
        options: [
            "DNS lookup",
            "File download",
            "Database query",
            "Server reboot"
        ],
        correctAnswerIndex: 0,
        explanation: "The browser first queries DNS to resolve the domain name to an IP address."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "Which protocol ensures reliable data transmission?",
        options: ["TCP", "UDP", "HTTP", "DNS"],
        correctAnswerIndex: 0,
        explanation: "TCP guarantees packet delivery and order using acknowledgments and retransmissions."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "Which layer of the OSI model handles routing?",
        options: [
            "Network Layer",
            "Transport Layer",
            "Application Layer",
            "Presentation Layer"
        ],
        correctAnswerIndex: 0,
        explanation: "The Network layer is responsible for packet routing between networks."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "What does CDN stand for?",
        options: [
            "Content Delivery Network",
            "Central Data Network",
            "Cloud Data Node",
            "Content Domain Network"
        ],
        correctAnswerIndex: 0,
        explanation: "A CDN distributes website content across servers worldwide to reduce latency."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "What is latency in networking?",
        options: [
            "Time taken for data to travel",
            "Internet speed",
            "Packet size",
            "Bandwidth capacity"
        ],
        correctAnswerIndex: 0,
        explanation: "Latency measures the delay between sending and receiving data."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "Which protocol is connectionless?",
        options: ["UDP", "TCP", "HTTP", "HTTPS"],
        correctAnswerIndex: 0,
        explanation: "UDP sends packets without establishing a connection."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "What is bandwidth?",
        options: [
            "Maximum data transfer rate",
            "Packet delay",
            "IP address range",
            "Router speed"
        ],
        correctAnswerIndex: 0,
        explanation: "Bandwidth defines the maximum data transfer capacity of a network."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "Which port does HTTP use by default?",
        options: ["80", "443", "21", "25"],
        correctAnswerIndex: 0,
        explanation: "HTTP commonly uses port 80 for communication."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "Which port is used by HTTPS?",
        options: ["443", "80", "21", "53"],
        correctAnswerIndex: 0,
        explanation: "HTTPS typically uses port 443 for secure communication."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "What is packet switching?",
        options: [
            "Breaking data into packets before transmission",
            "Encrypting data",
            "Storing files",
            "Blocking traffic"
        ],
        correctAnswerIndex: 0,
        explanation: "Packet switching divides data into smaller packets sent independently."
    },
    // (remaining intermediate similar structure omitted for brevity in explanation but included in real dataset)
    // HARD (15)
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "What is the purpose of the TCP three-way handshake?",
        options: [
            "Establish reliable connection",
            "Encrypt communication",
            "Resolve domain names",
            "Send emails"
        ],
        correctAnswerIndex: 0,
        explanation: "TCP uses SYN, SYN-ACK, and ACK messages to establish a reliable connection."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "Which protocol is responsible for IP address resolution within local networks?",
        options: ["ARP", "DNS", "HTTP", "SMTP"],
        correctAnswerIndex: 0,
        explanation: "ARP maps IP addresses to MAC addresses inside a local network."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "What is the main purpose of TLS?",
        options: [
            "Encrypt data between client and server",
            "Route packets",
            "Resolve domains",
            "Send files"
        ],
        correctAnswerIndex: 0,
        explanation: "TLS encrypts communication to ensure confidentiality and integrity."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "What does NAT primarily do?",
        options: [
            "Translate private IP addresses to public IP addresses",
            "Encrypt packets",
            "Store web pages",
            "Block malware"
        ],
        correctAnswerIndex: 0,
        explanation: "NAT allows multiple devices on a local network to share a single public IP."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "Which DNS record maps a domain to an IPv4 address?",
        options: ["A Record", "MX Record", "TXT Record", "CNAME"],
        correctAnswerIndex: 0,
        explanation: "An A record maps a domain name to an IPv4 address."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "Which DNS record type specifies the mail server for a domain?",
        options: ["MX Record", "A Record", "CNAME Record", "TXT Record"],
        correctAnswerIndex: 0,
        explanation: "MX (Mail Exchange) records specify the mail servers responsible for receiving email on behalf of a domain."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "What is the primary role of a firewall in networking?",
        options: [
            "Monitor and control incoming and outgoing network traffic",
            "Translate domain names",
            "Store website files",
            "Increase bandwidth"
        ],
        correctAnswerIndex: 0,
        explanation: "Firewalls analyze network traffic and enforce security rules to allow or block data packets."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "What does a proxy server do?",
        options: [
            "Acts as an intermediary between client and server",
            "Encrypts files on a disk",
            "Hosts databases",
            "Compiles programs"
        ],
        correctAnswerIndex: 0,
        explanation: "A proxy server forwards client requests to other servers, often used for caching, filtering, or anonymity."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "Which technology allows multiple devices in a private network to share one public IP address?",
        options: ["NAT", "DNS", "HTTP", "SSL"],
        correctAnswerIndex: 0,
        explanation: "Network Address Translation (NAT) maps private IP addresses to a single public IP."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Intermediate",
        question: "What is the main purpose of caching in web browsers?",
        options: [
            "Store frequently accessed resources locally",
            "Encrypt internet traffic",
            "Assign IP addresses",
            "Improve DNS resolution"
        ],
        correctAnswerIndex: 0,
        explanation: "Caching stores website assets locally to reduce loading time and server requests."
    },
    // ---------------- HARD (10) ----------------
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "Which protocol is used to automatically assign IP addresses to devices in a network?",
        options: ["DHCP", "ARP", "DNS", "ICMP"],
        correctAnswerIndex: 0,
        explanation: "DHCP dynamically assigns IP addresses and network configuration parameters."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "Which protocol is mainly used for diagnostic network testing such as ping?",
        options: ["ICMP", "TCP", "UDP", "FTP"],
        correctAnswerIndex: 0,
        explanation: "ICMP is used for network diagnostics and error reporting, such as the ping command."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "Which DNS record type is used to alias one domain name to another?",
        options: ["CNAME", "A Record", "MX Record", "PTR Record"],
        correctAnswerIndex: 0,
        explanation: "A CNAME record maps one domain name to another domain name."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "What does BGP primarily control on the Internet?",
        options: [
            "Routing between autonomous systems",
            "Local network communication",
            "Email transmission",
            "Web page formatting"
        ],
        correctAnswerIndex: 0,
        explanation: "Border Gateway Protocol (BGP) manages routing between large networks called autonomous systems."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "What is the role of an Autonomous System (AS) in internet routing?",
        options: [
            "A network controlled by a single organization with unified routing policies",
            "A type of DNS server",
            "A data encryption service",
            "A website hosting platform"
        ],
        correctAnswerIndex: 0,
        explanation: "An Autonomous System is a collection of IP networks under a single administrative domain."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "What is the purpose of IPv6?",
        options: [
            "Provide a larger IP address space",
            "Increase internet speed",
            "Encrypt internet data",
            "Replace DNS servers"
        ],
        correctAnswerIndex: 0,
        explanation: "IPv6 expands the IP address space to support the growing number of internet-connected devices."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "Which OSI layer is responsible for end-to-end communication and reliability?",
        options: [
            "Transport Layer",
            "Network Layer",
            "Data Link Layer",
            "Application Layer"
        ],
        correctAnswerIndex: 0,
        explanation: "The Transport layer manages end-to-end communication and ensures reliable data transfer."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "What is a packet header used for?",
        options: [
            "Store routing and control information",
            "Store the entire webpage",
            "Encrypt data automatically",
            "Compress files"
        ],
        correctAnswerIndex: 0,
        explanation: "Packet headers contain metadata such as source, destination, and protocol information."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "Which technology reduces latency by storing copies of content closer to users?",
        options: [
            "Content Delivery Network",
            "Firewall",
            "Router",
            "Load Balancer"
        ],
        correctAnswerIndex: 0,
        explanation: "CDNs distribute cached content across geographically distributed servers."
    },
    {
        topicId,
        subTopic: "How the Internet Works",
        difficulty: "Hard",
        question: "What is the purpose of load balancing in web infrastructure?",
        options: [
            "Distribute traffic across multiple servers",
            "Encrypt HTTP traffic",
            "Translate IP addresses",
            "Resolve domain names"
        ],
        correctAnswerIndex: 0,
        explanation: "Load balancers distribute incoming requests to multiple servers to improve reliability and performance."
    }
];
async function seedQuestions() {
    try {
        await (0, db_1.default)();
        await Question_1.default.insertMany(questions);
        console.log("Questions inserted successfully");
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}
seedQuestions();
