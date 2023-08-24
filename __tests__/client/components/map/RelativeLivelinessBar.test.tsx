/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { ActionsTracksChange } from "src/client/firestore/actionTracks.firestore";
import { User } from "src/knowledgeTypes";

import { RelativeLivelinessTypes, SYNCHRONIZE_RELATIVE } from "@/components/map/Liveliness/liveliness.utils";
import { MemoizedRelativeLivelinessBar } from "@/components/map/Liveliness/RelativeLivelinessBar";

jest.mock("firebase/firestore", () => ({ __esModule: true, getFirestore: jest.fn() }));

jest.mock("src/client/firestore/actionTracks.firestore", () => {
  const originalModule = jest.requireActual<typeof import("src/client/firestore/actionTracks.firestore")>(
    "src/client/firestore/actionTracks.firestore"
  );

  // @ts-ignore
  const actionTrackChange = {
    type: "added",
    data: {
      accepted: false,
      action: "",
      doer: "jjnnx",
      email: "j@gmail.com",
      nodeId: "",
      receivers: [],
      type: "NodeOpen",
      id: "1",
      imageUrl: "",
      chooseUname: true,
      fullname: "jj pp",
    },
  } as ActionsTracksChange;

  return {
    __esModule: true,
    ...originalModule,
    getActionTrackSnapshot: (db: any, data: any, callback: (changes: ActionsTracksChange[]) => void) => {
      callback([actionTrackChange]);
      return jest.fn();
    },
  };
});

describe("should render relative liveliness bar", () => {
  it("should render relative interactions liveliness bars with the students", async () => {
    const variant: RelativeLivelinessTypes = "relativeInteractions";
    const user = {
      uname: "jjnnx",
      email: "j@gmail.com",
      fName: "jj",
      lName: "pp",
      chooseUname: false,
      imageUrl: "",
    } as User;

    const Wrapper = () => {
      const [open, setOpen] = useState(false);
      return (
        <MemoizedRelativeLivelinessBar
          open={open}
          onToggleDisplay={() => setOpen(p => !p)}
          onlineUsers={[]}
          openUserInfoSidebar={() => {}}
          user={user}
          variant={variant}
        />
      );
    };

    render(<Wrapper />);

    expect(screen.getByRole("feed")).toHaveAttribute("aria-label", SYNCHRONIZE_RELATIVE[variant].name);
    const buttonToDisplay = await screen.findByRole("button", { name: "Display relative interaction liveliness bar" });
    fireEvent.click(buttonToDisplay);

    await screen.findByText("JP"); // find avatar, we don't test image because this should set up a server with images, that should be tested on e2e
    const moreElementsElement = screen.queryByText("+");
    expect(moreElementsElement).toBeNull();
    const buttonToHide = await screen.findByRole("button", { name: "Hide relative interaction liveliness bar" });
    fireEvent.click(buttonToHide);

    await screen.findByRole("button", { name: "Display relative interaction liveliness bar" });
  });

  it("should render relative reputation liveliness bars with the students", async () => {
    const variant: RelativeLivelinessTypes = "relativeReputations";
    const user = {
      uname: "jjnnx",
      email: "j@gmail.com",
      fName: "jj",
      lName: "pp",
      chooseUname: false,
      imageUrl: "",
    } as User;

    const Wrapper = () => {
      const [open, setOpen] = useState(false);
      return (
        <MemoizedRelativeLivelinessBar
          open={open}
          onToggleDisplay={() => setOpen(p => !p)}
          onlineUsers={[]}
          openUserInfoSidebar={() => {}}
          user={user}
          variant={variant}
        />
      );
    };

    render(<Wrapper />);

    expect(screen.getByRole("feed")).toHaveAttribute("aria-label", SYNCHRONIZE_RELATIVE[variant].name);
    const buttonToDisplay = await screen.findByRole("button", { name: "Display relative reputation liveliness bar" });
    fireEvent.click(buttonToDisplay);

    await screen.findByText("JP"); // find avatar, we don't test image because this should set up a server with images, that should be tested on e2e
    const moreElementsElement = screen.queryByText("+");
    expect(moreElementsElement).toBeNull();
    const buttonToHide = await screen.findByRole("button", { name: "Hide relative reputation liveliness bar" });
    fireEvent.click(buttonToHide);

    await screen.findByRole("button", { name: "Display relative reputation liveliness bar" });
  });
});
