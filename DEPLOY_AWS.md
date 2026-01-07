# AWS Deployment Guide for Computer Store App

This guide details how to deploy your Next.js application to Amazon Web Services (AWS) with a linked MySQL database hosted on Amazon RDS.

## Prerequisites
- An active AWS Account.
- AWS CLI installed and configured (optional but helpful).
- Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket) for easy deployment.

---

## Step 1: Create the Database (AWS RDS)

1. **Log in to AWS Console** and search for **RDS**.
2. Click **Create database**.
3. **Choose a database creation method**: Standard create.
4. **Engine options**: Select **MySQL** (since your schema provider is `mysql`).
5. **Templates**: Select **Free tier** (if available/applicable) or **Dev/Test**.
6. **Settings**:
   - **DB instance identifier**: `computer-store-db` (or similar).
   - **Master username**: `admin` (or your preferred username).
   - **Master password**: Create a strong password (and write it down!).
7. **Instance configuration**: `db.t3.micro` is usually sufficient for testing/small scale.
8. **Storage**: General Purpose SSD (gp2 or gp3). 20 GiB is default.
9. **Connectivity**:
   - **Compute resource**: Select "Don't connect to an EC2 compute resource" for now.
   - **Public access**: **Yes** (Recommended for easiest setup with Amplify/local migrations, but requires strong password). *If you choose No, you will need complex VPC peering to connect.*
   - **VPC security group**: Create new. Name it `computer-store-sg`.
10. **Additional configuration** (at the bottom):
    - **Initial database name**: `computer_store` (Important! This creates the actual DB inside the instance).
11. Click **Create database**. 
    *It will take a few minutes to become "Available".*

### Get Your Database Connection String
Once the database is **Available**:
1. Click on the DB identifier (`computer-store-db`).
2. Under **Connectivity & security**, look for **Endpoint** (e.g., `computer-store-db.cj....region.rds.amazonaws.com`).
3. Construct your `DATABASE_URL`:
   ```
   mysql://<username>:<password>@<endpoint>:3306/<database_name>
   ```
   *Example:* `mysql://admin:MyStr0ngPass@computer-store-db.xxx.us-east-1.rds.amazonaws.com:3306/computer_store`

---

## Step 2: Initialize the Database

Before deploying the app code, you need to push your schema to the new RDS database.

1. Open your local terminal in the project root.
2. Update your local `.env` file (temporarily) or just run the command with the var:
   ```bash
   # On Windows PowerShell
   $env:DATABASE_URL="mysql://admin:MyStr0ngPass@<endpoint>:3306/computer_store"
   npx prisma migrate deploy
   ```
   *This creates the tables in your RDS database.*
3. (Optional) Run the seed script if you have one:
   ```bash
   npx prisma db seed
   ```

---

## Step 3: Deploy the Application

We recommend **AWS Amplify** for Next.js applications as it manages the build process, SSL, and server configuration automatically.

### Option A: AWS Amplify (Recommended)

1. Search for **Amplify** in AWS Console.
2. Click **Create new app** -> **GitHub** (or your git provider).
3. Authorize AWS Amplify to access your GitHub account.
4. **Select repository**: Choose the `computer-store` repo.
5. **Select branch**: `main` (or your production branch).
6. **Build settings**:
   - Amplify automatically detects it's a Next.js app.
   - It usually auto-populates the build command (`npm run build`).
7. **Advanced settings** (Crucial Step):
   - Add **Environment variables**.
   - Key: `DATABASE_URL`
   - Value: `mysql://admin:MyStr0ngPass@<endpoint>:3306/computer_store` (Your RDS URL).
   - *Add any other secrets from your .env here (e.g., NEXTAUTH_SECRET, etc.).*
8. Click **Next** -> **Save and deploy**.

Amplify will now pull your code, build it, and deploy it. It provides a default `https://...amplifyapp.com` URL.

### Option B: EC2 (Virtual Private Server)

Use this if you want full control over the server (Ubuntu).

1. **Launch Instance**: Ubuntu 22.04 or 24.04 LTS.
2. **Security Group**: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS).
3. **SSH into the instance** and install dependencies:
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx -y
   sudo npm install -g pm2
   ```
4. **Clone your project**:
   ```bash
   git clone <your_repo_url>
   cd computer-store
   npm install
   ```
5. **Configure Environment**:
   Create a `.env` file:
   ```bash
   nano .env
   # Paste your DATABASE_URL and other secrets here
   ```
6. **Build and Start**:
   ```bash
   npx prisma generate
   npm run build
   pm2 start npm --name "computer-store" -- start
   ```
7. **Setup Nginx (Reverse Proxy)**:
   Configure `/etc/nginx/sites-available/default` to proxy requests to `localhost:3000`.

---

## Troubleshooting

- **Database Connection Error**: 
  - Check RDS Security Group inbound rules. Ensure it allows TCP traffic on port `3306` from "Anywhere" (0.0.0.0/0) if you are connecting from outside the VPC (e.g., Amplify or Localhost). 
  - *Note: For production, it's safer to restrict this IP, but "Anywhere" is common for starting out.*
- **Build Fails on Amplify**:
  - Check the "Build" logs. Ensure `npx prisma generate` runs during the build. You can add it to the `build` script in `package.json` like `"build": "npx prisma generate && next build"`.

