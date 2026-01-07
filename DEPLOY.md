# Deployment Guide for cPanel

This guide explains how to deploy your Computer Store application to a cPanel hosting environment using the "Setup Node.js App" feature.

## 1. Prerequisites

*   **cPanel Hosting** with "Setup Node.js App" enabled.
*   **MySQL Database** created in cPanel.
*   **Domain or Subdomain** pointed to your hosting.

## 2. Prepare the Application (Local Machine)

1.  **Build the App**:
    Run the following command in your local terminal to create a production optimized build:
    ```bash
    npm run build
    ```
    This will create a `.next` folder. Because we enabled `output: 'standalone'`, it also creates a special self-contained folder at `.next/standalone`.

2.  **Prepare Files for Upload**:
    You need to upload the contents of the standalone folder and the public assets.
    
    *   Navigate to `.next/standalone`.
    *   **Copy** the `public` folder from your root project directory (where your `package.json` is) into `.next/standalone/public`.
    *   **Copy** the `.next/static` folder from your build directory into `.next/standalone/.next/static`.
    
    **Zip the contents** of `.next/standalone`. This zip file is what you will upload.

## 3. Upload to cPanel

1.  Log in to cPanel.
2.  Go to **File Manager**.
3.  Create a folder for your app (e.g., `computer-store`).
4.  **Upload** the zip file you created in Step 2.
5.  **Extract** the zip file into this folder.

## 4. Set up Node.js App in cPanel

1.  Go to **Setup Node.js App** in cPanel dashboard.
2.  Click **Create Application**.
3.  **Node.js Version**: Select the recommended version (e.g., 18.x or 20.x).
4.  **Application Mode**: Production.
5.  **Application Root**: The folder you created (e.g., `computer-store`).
6.  **Application URL**: Select your domain.
7.  **Application Startup File**: `server.js` (Verify this file exists in your uploaded folder; the standalone build produces it).
8.  Click **Create**.

## 5. Connecting the Database

1.  Go to **MySQL Databases** in cPanel.
2.  Create a NEW database (e.g., `user_computerstore`).
3.  Create a NEW user and assign it to the database with ALL PRIVILEGES.
4.  Go back to **Setup Node.js App** settings.
5.  Click **Environment Variables** (Section usually near the bottom).
6.  Add `DATABASE_URL`:
    ```
    mysql://db_user:db_password@localhost:3306/db_name
    ```
    *(Replace `db_user`, `db_password`, `db_name` with your actual cPanel values)*.
7.  Add any other vars like `NEXTAUTH_SECRET` (generate a random string).

## 6. Running Database Migrations

This is the most critical step to ensure your Tables exist.

1.  In the Node.js App settings, you will see a command to enter the virtual environment (something like `source /home/user/nodevenv/.../activate`).
2.  Copy that command.
3.  Open **Terminal** in cPanel (or SSH).
4.  Paste the command to enter the virtual environment.
5.  Run the migration command:
    ```bash
    npx prisma db push
    ```
    *(We use `db push` here because it synchronizes the schema without needing the migration history files if you haven't uploaded them. For strict production handling, you would upload the `prisma/migrations` folder and use `npx prisma migrate deploy`)*.

    **Note**: Since we are using the standalone build, the `prisma` CLI might not be bundled. 
    **If `npx prisma` fails**:
    *   You might need to copy `schema.prisma` to your root folder in cPanel.
    *   Run `npm install prisma @prisma/client` inside the cPanel terminal.
    *   Then run `npx prisma db push`.

## 7. Updating the App (Safe Method)

To update the app **WITHOUT deleting data**:

1.  **NEVER delete your database** in MySQL Databases.
2.  **NEVER delete the `.env` configuration** in the Node.js App settings.
3.  **To Update Code**:
    *   Build locally (`npm run build`).
    *   Prepare the updated zip file (Step 2).
    *   In cPanel File Manager, delete the old application files (EXCEPT `.env` or `node_modules` if you want to keep them, though standalone usually replaces everything).
    *   Upload and Extract the new Zip.
    *   Restoring `node_modules` shouldn't be needed as standalone includes necessary dependencies, but you might need to run `npm install` for newly added global tools.
4.  **To Update Database Schema**:
    *   If you added new fields (like we did with `serialNumbers`), you MUST run the migration command again in Terminal:
    *   `npx prisma db push`
    *   Prisma will alter the tables to match the new code WITHOUT deleting your existing users/orders/invoices (unless you explicitly removed columns in your code).

## 8. Start the App

1.  Go back to **Setup Node.js App**.
2.  Click **Restart Application**.
3.  Visit your URL.
