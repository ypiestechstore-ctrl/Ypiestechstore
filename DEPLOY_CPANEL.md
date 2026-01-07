# Deploying to cPanel

This guide provides step-by-step instructions for deploying your Next.js application to cPanel.

## Prerequisites

1.  **Node.js Support**: Your cPanel hosting must support Node.js (look for "Setup Node.js App" icon).
2.  **Database**: You need a MySQL database created in cPanel.

---

## Step 1: Prepare Your Application

We've already configured `next.config.ts` to output a standalone build, which is easier to deploy.

1.  **Build the project locally**:
    Open your terminal in the project folder and run:
    ```bash
    npm run build
    ```

    This will create a `.next` folder. We are interested in the `.next/standalone` folder.

2.  **Prepare the Deployment Package**:
    The generic `standalone` build doesn't include the public folder or static assets by default in the right place for some servers, so we need to copy them manually to ensure everything works.

    *   Create a new folder on your Desktop called `deploy-packTage`.
    *   Copy the contents of `.next/standalone` into `deploy-package`.
    *   Copy your `public` folder into `deploy-package/public`.
    *   Copy the `.next/static` folder into `deploy-package/.next/static`.

    Your `deploy-package` folder should look like this:
    ```
    deploy-package/
    ├── .next/
    │   ├── static/    <-- (copied from .next/static)
    │   └── ...
    ├── node_modules/
    ├── public/        <-- (copied from root public)
    ├── package.json
    ├── server.js
    └── ...
    ```

3.  **Zip the Package**:
    Select all files inside `deploy-package` and zip them into `app.zip`.

---

## Step 2: Configure Database in cPanel

1.  Log in to cPanel.
2.  Go to **MySQL® Database Wizard**.
3.  Create a new database (e.g., `yourname_computerstore`).
4.  Create a user and password. Note these down.
5.  Assign the user to the database with **ALL PRIVILEGES**.

---

## Step 3: Setup Node.js in cPanel

1.  Go to **Setup Node.js App** in cPanel.
2.  Click **Create Application**.
3.  **Python/Node Version**: Select **Node.js 18** or **20** (Recommended).
4.  **Application Mode**: `Production`.
5.  **Application Root**: `computer-store` (or any name you prefer).
6.  **Application URL**: Select your domain.
7.  **Application Startup File**: `server.js`.
8.  Click **Create**.

---

## Step 4: Upload Files

1.  After creation, click the resulting command to enter the virtual environment (it looks like `source /home/user/nodevenv/...`). **Copy this command** (you'll need it for the terminal later if available, otherwise ignore).
2.  Stop the App (click "Stop App").
3.  Go to **File Manager** in cPanel.
4.  Navigate to the **Application Root** folder you created (e.g., `computer-store`).
5.  Delete any default files created there (like `app.js` or `index.html`) except `.htaccess` if present (leave `.htaccess` alone if the app created it).
6.  **Upload** your `app.zip` to this folder.
7.  **Extract** `app.zip`.

---

## Step 5: Configure Environment Variables

1.  In the **Setup Node.js App** page, scroll to "Environment Variables" (if available in UI) OR create a `.env` file in the File Manager in your app root.
2.  If creating a `.env` file manually, add:
    ```
    DATABASE_URL="mysql://dbuser:password@localhost:3306/dbname"
    NEXT_PUBLIC_APP_URL="https://yourdomain.com"
    ```
    Replace `dbuser`, `password`, `dbname` with the credentials you created in Step 2.

    *Note: If the UI has an "Add Variable" section, add `DATABASE_URL` there instead.*

---

## Step 6: Install Dependencies & Migrate Database

We need to install the dependencies (especially Prisma) on the Linux server to ensure the correct binary engines are downloaded.

1.  **If your cPanel has Terminal**:
    *   Open **Terminal**.
    *   Paste the `source ...` command you copied in Step 3 to enter the node environment.
    *   Navigate to your app folder: `cd computer-store`
    *   Run: `npm install` (This ensures Linux binaries for Prisma are downloaded).
    *   Run: `npx prisma db push` (This creates the tables in your cPanel database).

2.  **If NO Terminal**:
    *   In the **Setup Node.js App** page, there might be a button "Run NPM Install". Click it.
    *   For the database migration without terminal:
        You might need to connect to the remote database from your local machine.
        *   In cPanel, go to "Remote MySQL". Add your IP address.
        *   On your local machine, edit `.env` to point to the remote server IP.
        *   Run `npx prisma db push` locally.
        *   *Remember to revert your local .env afterwards!*

---

## Step 7: Start the App

1.  Go back to **Setup Node.js App**.
2.  Click **Start App**.
3.  Visit your domain. The app should be live!

---

## Troubleshooting

*   **500 Error**: Check the `stderr.log` in your app folder.
*   **Database Error**: Ensure `DATABASE_URL` is correct and the user has permissions.
*   **Missing Images/Styles**: Double check you copied the `.next/static` folder to `.next/standalone/.next/static` correctly. The server expects static files to be in `.next/static`.
