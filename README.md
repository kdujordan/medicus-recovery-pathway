# Medicus Recovery Pathway

Landing page for Medicus with a waitlist sign-up.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole page (styles, GSAP animations and scripts inline) |
| `logo.png`, `favicon.png` | Logo and browser-tab icon |
| `poster.jpg`, `medicus-launch.mp4` | Launch film and its cover image |
| `google-apps-script.gs` | Receives waitlist sign-ups and writes them to your Google Sheet |

## Where sign-ups go

- **On GitHub Pages (or any normal website):** to a Google Sheet that only you can open. Anyone can sign up, with no account needed.
- **On claude.ai:** to the artifact's own database, managed with the **Manage** button (visible only to the page owner).

## 1. Connect the Google Sheet

1. Create a new Google Sheet, for example "Medicus waitlist".
2. Open **Extensions → Apps Script**. Delete the sample code, paste in all of `google-apps-script.gs`, and save.
3. Click **Deploy → New deployment**. Choose the type **Web app**, then set:
   - **Execute as:** Me
   - **Who has access:** Anyone

   "Anyone" lets visitors *submit* the form. It does not let them see the sheet; only you can open it.
4. Click **Deploy** and approve the permissions. Google warns that the app isn't verified, because it's your own script: choose **Advanced → Go to … (unsafe)**.
5. Copy the **Web app URL** (it ends in `/exec`). Open it in a browser; you should see `{"ok":true,"service":"medicus-waitlist"}`.
6. In `index.html`, find `var SHEETS_URL = "";` and paste the URL between the quotes.

The first sign-up creates a **Waitlist** tab with the column headers. To track progress, add your own columns to the right of **Updated**, such as Status and Notes. The script never changes them.

If you edit the script later, use **Deploy → Manage deployments → Edit → New version** so the `/exec` URL stays the same.

## 2. Publish on GitHub Pages

1. Create a GitHub repository and upload all the files above to its root.
2. Go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then select `main` and `/ (root)`, and save.
3. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Privacy

The Google Sheet stays private to your Google account. The web app only accepts new rows, and it updates the existing row when someone signs up again with the same email. A hidden honeypot field filters out simple spam bots.
