import Container from "@mui/material/Container";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { ComponentType, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";

import HomeFilter, { HomeFilterRef } from "@/components/HomeFilter";
import HomeSearch, { HomeSearchRef } from "@/components/HomeSearch";
import { getSearchNodes } from "@/lib/knowledgeApi";
import { ONECADEMY_DOMAIN } from "@/lib/utils/1cademyConfig";
import {
  getDefaultSortedByType,
  getQueryParameter,
  getQueryParameterAsBoolean,
  getQueryParameterAsNumber,
  homePageSortByDefaults,
} from "@/lib/utils/utils";

// import PublicLayout from "../components/layouts/PublicLayout";
import { useOnScreen } from "../hooks/useOnScreen";
import { FilterValue, NextPageWithLayout, SortTypeWindowOption, TimeWindowOption } from "../knowledgeTypes";
export const PagesNavbar: ComponentType<any> = dynamic(() => import("@/components/PagesNavbar").then(m => m.default), {
  ssr: false,
});

export const SortByFilters: ComponentType<any> = dynamic(
  () => import("@/components/SortByFilters").then(m => m.default),
  {
    ssr: false,
  }
);

const MasonryNodes: ComponentType<any> = dynamic(() => import("@/components/MasonryNodes").then(m => m.MasonryNodes), {
  ssr: false,
});

const SearcherPage: NextPageWithLayout = () => {
  const router = useRouter();
  const upvotes = getQueryParameterAsBoolean(router.query.upvotes || String(homePageSortByDefaults.upvotes));
  const mostRecent = getQueryParameterAsBoolean(router.query.mostRecent || String(homePageSortByDefaults.mostRecent));
  const [sortedByType, setSortedByType] = useState<SortTypeWindowOption>(
    getDefaultSortedByType({ mostRecent, upvotes })
  );
  const [openAdvanceFilter, setOpenAdvanceFilter] = useState(false);

  const homeSearchRef = useRef<HomeSearchRef>(null);
  const homeFilterRef = useRef<HomeFilterRef>(null);

  const isIntersecting = useOnScreen(homeSearchRef.current?.containerRef, true);

  const q = getQueryParameter(router.query.q) || "*";

  const timeWindow: TimeWindowOption =
    (getQueryParameter(router.query.timeWindow) as TimeWindowOption) || homePageSortByDefaults.timeWindow;
  const tags = getQueryParameter(router.query.tags) || "";
  const institutions = getQueryParameter(router.query.institutions) || "";
  const contributors = getQueryParameter(router.query.contributors) || "";

  const reference = getQueryParameter(router.query.reference) || "";
  const label = getQueryParameter(router.query.label) || "";
  const nodeTypes = getQueryParameter(router.query.nodeTypes) || "";
  const page = getQueryParameterAsNumber(router.query.page) || 1;
  const nodeSearchKeys = {
    q,
    upvotes,
    mostRecent,
    timeWindow,
    tags,
    institutions,
    contributors,
    reference,
    label,
    page,
    nodeTypes,
  };

  const { data, isLoading } = useQuery(["nodesSearch", nodeSearchKeys], () => getSearchNodes(nodeSearchKeys));

  useEffect(() => {
    const qq = router.query.q || "";
    const hasQueryValue = qq && qq !== "*";
    if (router.isReady && data?.data && hasQueryValue) {
      // TODO: improve this adding reference in masonry, scroll margin
      document.body.clientWidth >= 900 ? homeSearchRef.current?.scroll() : homeSearchRef.current?.scroll();
    }
  }, [router.isReady, data?.data, router.query.q]);

  const handleSearch = (text: string) => {
    router.push({ query: { ...router.query, q: text, page: 1 } }, undefined, {
      scroll: false,
    });
  };

  const handleChangePage = (newPage: number) => {
    router.push({ query: { ...router.query, page: newPage } });
  };

  const handleByType = (val: SortTypeWindowOption) => {
    if (val === SortTypeWindowOption.MOST_RECENT) {
      router.push({ query: { ...router.query, mostRecent: true, upvotes: false, page: 1 } }, undefined, {
        scroll: false,
      });
      return setSortedByType(val);
    }
    if (val === SortTypeWindowOption.UPVOTES_DOWNVOTES) {
      router.push({ query: { ...router.query, mostRecent: false, upvotes: true, page: 1 } }, undefined, {
        scroll: false,
      });
      return setSortedByType(val);
    }
    router.push({ query: { ...router.query, mostRecent: false, upvotes: false, page: 1 } }, undefined, {
      scroll: false,
    });
    setSortedByType(SortTypeWindowOption.NONE);
  };

  const handleChangeTimeWindow = (val: TimeWindowOption) => {
    router.push({ query: { ...router.query, timeWindow: val, page: 1 } }, undefined, {
      scroll: false,
    });
  };

  const handleTagsChange = (tags: string[]) => {
    router.push({ query: { ...router.query, tags: tags.join(","), page: 1 } }, undefined, {
      scroll: false,
    });
  };

  const handleInstitutionsChange = (newValue: FilterValue[]) => {
    const institutions = newValue.map((el: FilterValue) => el.id);
    router.push({ query: { ...router.query, institutions: institutions.join(","), page: 1 } }, undefined, {
      scroll: false,
    });
  };

  const handleContributorsChange = (newValue: FilterValue[]) => {
    const contributors = newValue.map((el: FilterValue) => el.id);
    router.push({ query: { ...router.query, contributors: contributors.join(","), page: 1 } }, undefined, {
      scroll: false,
    });
  };

  const handleNodeTypesChange = (nodeTypes: string[]) => {
    router.push({ query: { ...router.query, nodeTypes: nodeTypes.join(","), page: 1 } }, undefined, {
      scroll: false,
    });
  };

  const handleReferencesChange = (title: string, label: string) => {
    router.push({ query: { ...router.query, reference: title, label, page: 1 } }, undefined, { scroll: false });
  };

  const onClickSearcher = () => {
    if (!homeSearchRef?.current || !document) return;
    window.scrollTo({
      behavior: "smooth",
      left: 0,
      top: 0,
    });

    homeSearchRef.current.setFocusOnInput();
  };

  return (
    <PagesNavbar onClickSearcher={!isIntersecting ? onClickSearcher : undefined} enableMenu>
      <Head>
        <link rel="canonical" href={`${ONECADEMY_DOMAIN}/search`} key="canonical" />
        <title>1Cademy - Search</title>
      </Head>
      <HomeSearch onSearch={handleSearch} ref={homeSearchRef} setOpenAdvanceFilter={setOpenAdvanceFilter} />
      <Container sx={{ py: 10 }}>
        {openAdvanceFilter && (
          <HomeFilter
            onTagsChange={handleTagsChange}
            onInstitutionsChange={handleInstitutionsChange}
            onContributorsChange={handleContributorsChange}
            onNodeTypesChange={handleNodeTypesChange}
            onReferencesChange={handleReferencesChange}
            ref={homeFilterRef}
          ></HomeFilter>
        )}
        <SortByFilters
          sortedByType={sortedByType}
          handleByType={handleByType}
          timeWindow={timeWindow}
          onTimeWindowChanged={handleChangeTimeWindow}
        />
        <MasonryNodes
          nodes={data?.data || []}
          page={page}
          totalPages={Math.ceil((data?.numResults || 0) / (data?.perPage || homePageSortByDefaults.perPage))}
          onChangePage={handleChangePage}
          isLoading={isLoading}
        />
      </Container>
    </PagesNavbar>
  );
};

export default SearcherPage;
