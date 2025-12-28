/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/api/:path*',
        },
      ],
    };
  },
  webpack: (config, { dev, isServer }) => {
    // Disable source maps in production to avoid eval usage
    if (!dev && !isServer) {
      config.devtool = false;
    } else if (dev) {
      // Disable cache in development to prevent cache-related warnings
      config.cache = false;
      
      // Configure webpack dev server
      config.devServer = {
        ...config.devServer,
        hot: true,
        client: {
          logging: 'error',
          overlay: true,
        },
      };
      
      // Disable cache for specific loaders if needed
      const rules = config.module.rules || [];
      config.module.rules = rules.map(rule => {
        if (rule.loader && rule.loader.includes('file-loader')) {
          return {
            ...rule,
            options: {
              ...(rule.options || {}),
              cacheDirectory: false,
            },
          };
        }
        return rule;
      });
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    
    // Add webpack configuration to handle eval in development
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000,
        ignored: ['node_modules/**', '.next/**'],
      };
    }
    
    // Add CSP headers in development
    if (!isServer) {
      config.devServer = {
        ...config.devServer,
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:;",
              "font-src 'self' data:;",
              "connect-src 'self' http://localhost:3001 https:;",
              "frame-src 'self';",
            ].join('; ')
          }
        ]
      };
    }
    
    return config;
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    // Base CSP rules that apply to all environments
    let csp;

    if (isDev) {
      // In development, allow unsafe-inline and unsafe-eval for HMR and development tools
      csp = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:;
        style-src 'self' 'unsafe-inline' https: http:;
        img-src 'self' data: blob: https: http:;
        font-src 'self' data: https: http:;
        connect-src 'self' http://localhost:3001 https: http:;
        frame-src 'self' https: http: blob:;
        media-src 'self' https: http:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'self';
      `.replace(/\s+/g, ' ').trim();
    } else {
      // In production, use strict-dynamic but allow specific sources
      csp = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' https: 'strict-dynamic';
        style-src 'self' 'unsafe-inline' https: http:;
        img-src 'self' data: https: http:;
        font-src 'self' data: https: http:;
        connect-src 'self' https: http:;
        frame-src 'self' https: http:;
        media-src 'self' https: http:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'self';
        upgrade-insecure-requests;
      `.replace(/\s+/g, ' ').trim();
    }

    return [
      {
        // Apply these headers to all routes in your application
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Add CSP header
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          // Add other security headers
          ...securityHeaders,
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production',
  },
  // Disable React's strict mode in development to prevent double-rendering
  reactStrictMode: process.env.NODE_ENV === 'development' ? false : true,
};

// For analyzing bundle size
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
