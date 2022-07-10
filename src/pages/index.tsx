import Container from "@mui/material/Container";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { ComponentType, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";

import HomeFilter, { HomeFilterRef } from "@/components/HomeFilter";
import HomeSearch, { HomeSearchRef } from "@/components/HomeSearch";
import { getSearchNodes } from "@/lib/knowledgeApi";
import {
  getDefaultSortedByType,
  getQueryParameter,
  getQueryParameterAsBoolean,
  getQueryParameterAsNumber,
  homePageSortByDefaults
} from "@/lib/utils/utils";

import { useOnScreen } from "../hooks/useOnScreen";
import { FilterValue, SortTypeWindowOption, TimeWindowOption } from "../knowledgeTypes";

export const PagesNavbar: ComponentType<any> = dynamic(() => import("@/components/PagesNavbar").then(m => m.default), {
  ssr: false
});

export const SortByFilters: ComponentType<any> = dynamic(
  () => import("@/components/SortByFilters").then(m => m.default),
  {
    ssr: false
  }
);

const MasonryNodes: ComponentType<any> = dynamic(() => import("@/components/MasonryNodes").then(m => m.MasonryNodes), {
  ssr: false
});

const HomePage: NextPage = () => {
  const router = useRouter();
  const upvotes = getQueryParameterAsBoolean(router.query.upvotes || String(homePageSortByDefaults.upvotes));
  const mostRecent = getQueryParameterAsBoolean(router.query.mostRecent || String(homePageSortByDefaults.mostRecent));
  const [sortedByType, setSortedByType] = useState<SortTypeWindowOption>(
    getDefaultSortedByType({ mostRecent, upvotes })
  );

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
    nodeTypes
  };

  const { data, isLoading } = useQuery(["nodesSearch", nodeSearchKeys], () => getSearchNodes(nodeSearchKeys));

  useEffect(() => {
    const qq = router.query.q || "";
    const hasQueryValue = qq && qq !== "*";
    if (router.isReady && data?.data && hasQueryValue) {
      document.body.clientWidth >= 900 ? homeSearchRef.current?.scroll() : homeFilterRef.current?.scroll();
    }
  }, [router.isReady, data?.data, router.query.q]);

  const handleSearch = (text: string) => {
    router.push({ query: { ...router.query, q: text, page: 1 } });
  };

  const handleChangePage = (newPage: number) => {
    router.push({ query: { ...router.query, page: newPage } });
  };

  const handleByType = (val: SortTypeWindowOption) => {
    if (val === SortTypeWindowOption.MOST_RECENT) {
      router.push({ query: { ...router.query, mostRecent: true, upvotes: false, page: 1 } });
      return setSortedByType(val);
    }
    if (val === SortTypeWindowOption.UPVOTES_DOWNVOTES) {
      router.push({ query: { ...router.query, mostRecent: false, upvotes: true, page: 1 } });
      return setSortedByType(val);
    }
    router.push({ query: { ...router.query, mostRecent: false, upvotes: false, page: 1 } });
    setSortedByType(SortTypeWindowOption.NONE);
  };

  const handleChangeTimeWindow = (val: TimeWindowOption) => {
    router.push({ query: { ...router.query, timeWindow: val, page: 1 } });
  };

  const handleTagsChange = (tags: string[]) => {
    router.push({ query: { ...router.query, tags: tags.join(","), page: 1 } });
  };

  const handleInstitutionsChange = (newValue: FilterValue[]) => {
    const institutions = newValue.map((el: FilterValue) => el.id);
    router.push({ query: { ...router.query, institutions: institutions.join(","), page: 1 } });
  };

  const handleContributorsChange = (newValue: FilterValue[]) => {
    const contributors = newValue.map((el: FilterValue) => el.id);
    router.push({ query: { ...router.query, contributors: contributors.join(","), page: 1 } });
  };

  const handleNodeTypesChange = (nodeTypes: string[]) => {
    router.push({ query: { ...router.query, nodeTypes: nodeTypes.join(","), page: 1 } });
  };

  const handleReferencesChange = (title: string, label: string) => {
    router.push({ query: { ...router.query, reference: title, label, page: 1 } });
  };

  return (
    <PagesNavbar showSearch={!isIntersecting}>
      <HomeSearch sx={{ mt: "var(--navbar-height)" }} onSearch={handleSearch} ref={homeSearchRef} />
      <Container sx={{ my: 10 }}>
        <HomeFilter
          onTagsChange={handleTagsChange}
          onInstitutionsChange={handleInstitutionsChange}
          onContributorsChange={handleContributorsChange}
          onNodeTypesChange={handleNodeTypesChange}
          onReferencesChange={handleReferencesChange}
          ref={homeFilterRef}
        ></HomeFilter>
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

export default HomePage;
