# How to Host Your Website

Since you have already pushed your code to GitHub, the easiest and best way to host your website for free is using **Vercel** or **Netlify**.

## Option 1: Vercel (Recommended)

1.  **Go to Vercel**: Visit [https://vercel.com](https://vercel.com) and sign up/login with your **GitHub account**.
2.  **Add New Project**:
    *   Click on the **"Add New..."** button (usually top right).
    *   Select **"Project"**.
3.  **Import Repository**:
    *   You will see a list of your GitHub repositories.
    *   Find **`FINAL-Quantum-Shadows`** and click **Import**.
4.  **Configure & Deploy**:
    *   Vercel will automatically detect that this is a **Vite** project.
    *   Leave the default settings as they are.
    *   Click **Deploy**.
5.  **Done!**: Wait about a minute, and your site will be live on a `vercel.app` domain.

## Option 2: Netlify

1.  **Go to Netlify**: Visit [https://netlify.com](https://netlify.com) and login with **GitHub**.
2.  **New Site**:
    *   Click **"Add new site"** -> **"Import from Git"**.
3.  **Connect to GitHub**:
    *   Choose **GitHub** as your provider.
    *   Select the **`FINAL-Quantum-Shadows`** repository.
4.  **Deploy**:
    *   Netlify will detect the build command (`npm run build`) and publish directory (`dist`).
    *   Click **Deploy site**.

## Verification
I have verified that your project builds correctly locally (`npm run build` was successful), so it will work smoothly on these platforms.
