# tmpimg

cloudflare workers to generate placeholder images


# install

First you need a npm to be installed.
Scripts in `package.json` used local wrangler so you don't need to install it globally.

```bash
npm install
```

then you will need to copy the `wrangler.example.toml` to `wrangler.toml` and fill `account_id` with your account id you can found on your cloudflare dashboard.


# usage

To run the project locally, you can use the following command:

```bash
npm run dev
```

If you want deploy it to cloudflare, you can use the following command:

```bash
npm run deploy
```
