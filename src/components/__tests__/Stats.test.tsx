import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";

import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";

import { statsData } from "../../../testUtils/mockData/stats.data";
import * as api from "../../lib/knowledgeApi";
import Stats from "../Stats";

describe("Stats component", () => {
  const getStatsMock = jest.spyOn(api, "getStats");

  it("Should show stats", async () => {
    getStatsMock.mockImplementation(() => Promise.resolve(statsData));
    renderComponent();
    expect(
      await screen.findByText("Search 39,050 nodes and 113,646 links through 79,044 proposals")
    ).toBeInTheDocument();
    expect(await screen.findByText("from 1,436 users in 144 institutions")).toBeInTheDocument();
  });

  function renderComponent() {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <Stats />
      </QueryClientProvider>
    );
  }
});
