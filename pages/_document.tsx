// ** Emotion Imports
import createEmotionServer from "@emotion/server/create-instance";
import Document, { Head, Html, Main, NextScript } from "next/document";
import { Children } from "react";

import { getDesignTokens } from "../src/brandingTheme";
import { createEmotionCache } from "../src/createEmotionCache";

class CustomDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta
            name="theme-color"
            content={getDesignTokens("light").palette?.common?.darkGrayBackground}
            media="(prefers-color-scheme: light)"
          />
          <meta
            name="theme-color"
            content={getDesignTokens("dark").palette?.common?.darkGrayBackground}
            media="(prefers-color-scheme: dark)"
          />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <meta name="google-site-verification" content="XpDB7dCQFlAHNdpUyVmw5Iahh4FzqPzUMUmlOLoNs-Y" />
          <meta charSet="UTF-8" />
          <meta name="robots" content="index, follow" />
          <meta name="googlebot" content="index, follow" />
          <meta name="language" content="ENG" />
          <meta name="copyright" content="1Cademy" />
          <meta name="reply-to" content="onecademy@umich.edu" />
          <meta name="coverage" content="Worldwide" />
          <meta name="distribution" content="Global" />
          <meta name="rating" content="General" />
          <meta name="target" content="all" />
          <meta name="HandheldFriendly" content="False" />
          <meta name="author" content="1Cademy" />
          <meta httpEquiv="Expires" content="-1" />
          <meta httpEquiv="Pragma" content="no-cache" />
          <meta httpEquiv="Cache-Control" content="no-cache" />
          <meta httpEquiv="x-dns-prefetch-control" content="off" />
          {/* PWA primary color */}
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&family=Work+Sans:wght@600&display=swap"
            rel="stylesheet"
          ></link>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with static-site generation (SSG).
CustomDocument.getInitialProps = async ctx => {
  const originalRenderPage = ctx.renderPage;

  // You can consider sharing the same emotion cache between
  // all the SSR requests to speed up performance.
  // However, be aware that it can have global side effects.

  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      // eslint-disable-next-line react/display-name
      enhanceApp: App => props =>
        (
          <App
            {...props} // @ts-ignore
            emotionCache={cache}
          />
        )
    });

  const initialProps = await Document.getInitialProps(ctx);

  // This is important. It prevents emotion to render invalid HTML.
  // See
  // https://github.com/mui-org/material-ui/issues/26561#issuecomment-855286153

  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map(style => (
    <style
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
      data-emotion={`${style.key} ${style.ids.join(" ")}`}
    />
  ));

  return {
    ...initialProps,
    styles: [...Children.toArray(initialProps.styles), ...emotionStyleTags]
  };
};

export default CustomDocument;
