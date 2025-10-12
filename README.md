# 🌳 Tree Leaves Node.js Application

An interactive tree leaves application built with Node.js, Express, and real-time server-side storage.

## 🚀 Features

- **Interactive Tree**: Drag and rotate leaves on a beautiful tree
- **Real-time Growth**: Leaves grow automatically from server data
- **Cross-Device Sync**: Works across all browsers and devices
- **Server-side Storage**: Persistent data storage on the server
- **Thank You Integration**: Add leaves by visiting the thank you page
- **RESTful API**: Complete API for managing leaves data

## 📁 Project Structure

```
tree-leaves-app/
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel deployment configuration
├── routes/               # API route modules
│   ├── leaves.js         # Leaves CRUD operations
│   └── health.js         # Health check endpoints
├── public/               # Static files
│   ├── index.html        # Main tree page
│   ├── thank-you.html    # Thank you page
│   ├── tree1.png         # Tree image
│   ├── leaf_new.png      # Leaf image
│   └── background1.jpg   # Background image
├── data/                 # Server data storage
│   └── leaves-data.json  # Leaves database (auto-created)
└── README.md             # This file
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tree-leaves-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Start the production server**
   ```bash
   npm start
   ```

## 🌐 API Endpoints

### Leaves API

- **GET** `/api/leaves` - Get all grown leaves
- **POST** `/api/leaves` - Add a new leaf
- **DELETE** `/api/leaves` - Clear all leaves
- **GET** `/api/leaves/stats` - Get leaves statistics

### Health API

- **GET** `/api/health` - Application health check
- **GET** `/api/health/ready` - Readiness check
- **GET** `/api/health/live` - Liveness check

### Pages

- **GET** `/` - Main tree page
- **GET** `/thank-you` - Thank you page

## 🔧 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (placeholder)

### Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

Visit: `http://localhost:3000`

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Your app will be available at**: `https://your-project.vercel.app`

## 🎯 How It Works

1. **Page Load**: Fetches current leaves from server
2. **Auto-Monitoring**: Checks server every 2 seconds for new leaves
3. **Thank You Page**: Adds new leaf to server database
4. **Real-time Sync**: All users see the same tree state
5. **Persistent Storage**: Data survives server restarts

## 🧪 Testing

### Manual Testing

1. **Visit the main page**: `http://localhost:3000`
2. **Visit thank you page**: `http://localhost:3000/thank-you`
3. **Check API**: `http://localhost:3000/api/health`
4. **View stats**: `http://localhost:3000/api/leaves/stats`

### API Testing

```bash
# Get all leaves
curl http://localhost:3000/api/leaves

# Add a new leaf
curl -X POST http://localhost:3000/api/leaves \
  -H "Content-Type: application/json" \
  -d '{"index": 0, "source": "test"}'

# Clear all leaves
curl -X DELETE http://localhost:3000/api/leaves
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Request validation
- **Error Handling**: Comprehensive error handling
- **Rate Limiting**: Built-in Express protection

## 📊 Monitoring

- **Health Checks**: `/api/health`
- **Logging**: Morgan HTTP request logger
- **Error Tracking**: Console error logging
- **Performance**: Compression middleware

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License - see package.json for details

## 🆘 Support

For issues and questions:
1. Check the health endpoint: `/api/health`
2. Review server logs
3. Test API endpoints manually
4. Check browser console for client-side errors

---

**Happy Leaf Growing! 🌿**
