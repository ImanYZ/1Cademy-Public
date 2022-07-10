import NextHead from "next/head";
import { useRouter } from "next/router";
import { FC, ReactNode } from "react";
import { APP_DOMAIN } from "src/1cademyConfig";

type Props = {
  title?: string;
  description?: string;
  children?: ReactNode;
};

const Head: FC<Props> = props => {
  const {
    description = "1Cademy Knowledge Graph Public Interface!",
    title = "1Cademy Knowledge Graph!",
    children
  } = props;
  const router = useRouter();
  const preview = `${APP_DOMAIN}DarkmodeLogo.png`;

  return (
    <NextHead>
      <title>{title}</title>
      <meta name="robots" content="follow, index" />
      <meta name="description" content={description} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={preview} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:url" content={`${APP_DOMAIN.slice(0, -1)}${router.asPath}`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={preview} />
      <meta property="og:ttl" content="604800" />
      <meta name="docsearch:version" content="master" />
      {children}
    </NextHead>
  );
};

export default Head;
