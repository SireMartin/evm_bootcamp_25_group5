# Deploying the Lottery DApp

This guide will help you deploy the Lottery DApp to a hosting service so you can share it with others.

## Option 1: Deploy to Vercel (Recommended)

[Vercel](https://vercel.com/) is the easiest way to deploy a Next.js application.

1. Create a Vercel account at [vercel.com](https://vercel.com/)
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Navigate to your project directory:
   ```bash
   cd lottery-frontend
   ```
4. Deploy to Vercel:
   ```bash
   vercel
   ```
5. Follow the prompts to complete the deployment
6. Once deployed, Vercel will provide you with a URL for your DApp

## Option 2: Deploy to Netlify

[Netlify](https://www.netlify.com/) is another great option for deploying web applications.

1. Create a Netlify account at [netlify.com](https://www.netlify.com/)
2. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
3. Navigate to your project directory:
   ```bash
   cd lottery-frontend
   ```
4. Build your project:
   ```bash
   npm run build
   ```
5. Deploy to Netlify:
   ```bash
   netlify deploy
   ```
6. Follow the prompts to complete the deployment
7. Once deployed, Netlify will provide you with a URL for your DApp

## Option 3: Deploy to GitHub Pages

If you want to host your DApp on GitHub Pages:

1. Add the following to your `package.json`:
   ```json
   "scripts": {
     "export": "next build && next export",
     "deploy": "npm run export && touch out/.nojekyll && gh-pages -d out"
   }
   ```
2. Install the gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Add the following to your `next.config.js`:
   ```js
   module.exports = {
     basePath: '/your-repo-name',
     assetPrefix: '/your-repo-name/',
   }
   ```
4. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

## Important Notes for Deployment

1. **Update Contract Addresses**: Make sure your deployed DApp is using the correct contract addresses in `src/utils/config.ts`.

2. **MetaMask Authorization**: After deploying, users will need to authorize your deployed domain in MetaMask, not localhost.

3. **Environment Variables**: If you're using environment variables, make sure to set them in your hosting platform's settings.

4. **CORS Issues**: If you encounter CORS issues with your API endpoints, you may need to configure your hosting platform to allow cross-origin requests.

5. **Custom Domain**: For a more professional look, consider setting up a custom domain for your DApp.

## Sharing Your DApp

Once your DApp is deployed, you can share the URL with your friends. They will need to:

1. Have MetaMask installed
2. Be connected to the Sepolia testnet
3. Have some Sepolia ETH (they can get it from a faucet)
4. Authorize your domain in MetaMask

## Troubleshooting Deployment Issues

If you encounter issues during deployment:

1. Check the build logs for errors
2. Make sure all dependencies are correctly installed
3. Verify that your contract addresses are correct
4. Ensure your hosting platform supports the features used in your DApp 