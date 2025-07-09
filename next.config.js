/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["amazon-cognito-identity-js"],
  webpack: (config, { isServer }) => {
    // 解決 amazon-cognito-identity-js 的模組問題
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
    };

    return config;
  },
};

module.exports = nextConfig;
