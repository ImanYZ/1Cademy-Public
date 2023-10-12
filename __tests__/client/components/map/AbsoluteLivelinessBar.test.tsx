/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { ActionsTracksChange } from "src/client/firestore/actionTracks.firestore";

import { AbsoluteLivelinessTypes, SYNCHRONIZE_ABSOLUTE } from "@/components/map/Liveliness/liveliness.utils";
import { MemoizedLivelinessBar } from "@/components/map/Liveliness/LivelinessBar";

jest.mock("firebase/firestore", () => ({ __esModule: true, getFirestore: jest.fn() }));

jest.mock("src/client/firestore/actionTracks.firestore", () => {
  const originalModule = jest.requireActual<typeof import("src/client/firestore/actionTracks.firestore")>(
    "src/client/firestore/actionTracks.firestore"
  );

  // @ts-ignore
  const actionTrackChange = {
    type: "added",
    data: {
      accepted: true,
      action: "CorrectRM",
      doer: "jjnnx",
      email: "j@gmail.com",
      nodeId: "Lqi3MedWA3gWmZ3jjjUf",
      receivers: ["jjnnx"],
      type: "NodeVote",
      id: "1",
      imageUrl: "",
      chooseUname: true,
      fullname: "jj pp",
      receiverPoints: [-1],
      receiversData: {
        jjnnx: {
          imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
          chooseUname: false,
          fullname: "jjnnx pp",
        },
      },
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

describe("should render absolute liveliness bar", () => {
  it("should render absolute interactions liveliness bars with the students", async () => {
    const variant: AbsoluteLivelinessTypes = "absoluteInteractions";

    const Wrapper = () => {
      const [open, setOpen] = useState(false);
      return (
        <MemoizedLivelinessBar
          open={open}
          onToggleDisplay={() => setOpen(p => !p)}
          onlineUsers={[]}
          openUserInfoSidebar={() => {}}
          variant={variant}
        />
      );
    };

    render(<Wrapper />);

    expect(screen.getByRole("feed")).toHaveAttribute("aria-label", SYNCHRONIZE_ABSOLUTE[variant].name);
    const buttonToDisplay = await screen.findByRole("button", { name: "Display absolute interaction liveliness bar" });
    fireEvent.click(buttonToDisplay);

    await screen.findByText("JP"); // find avatar, we don't test image because this should set up a server with images, that should be tested on e2e
    const buttonToHide = await screen.findByRole("button", { name: "Hide absolute interaction liveliness bar" });
    fireEvent.click(buttonToHide);

    await screen.findByRole("button", { name: "Display absolute interaction liveliness bar" });
  });

  it("should render absolute reputation liveliness bars with the students", async () => {
    const variant: AbsoluteLivelinessTypes = "absoluteReputations";

    const Wrapper = () => {
      const [open, setOpen] = useState(false);
      return (
        <MemoizedLivelinessBar
          open={open}
          onToggleDisplay={() => setOpen(p => !p)}
          onlineUsers={[]}
          openUserInfoSidebar={() => {}}
          variant={variant}
        />
      );
    };

    render(<Wrapper />);

    expect(screen.getByRole("feed")).toHaveAttribute("aria-label", SYNCHRONIZE_ABSOLUTE[variant].name);
    const buttonToDisplay = await screen.findByRole("button", { name: "Display absolute reputation liveliness bar" });
    fireEvent.click(buttonToDisplay);

    await screen.findByText("JP"); // find avatar, we don't test image because this should set up a server with images, that should be tested on e2e
    const moreElementsElement = screen.queryByText("+");
    expect(moreElementsElement).toBeNull();
    const buttonToHide = await screen.findByRole("button", { name: "Hide absolute reputation liveliness bar" });
    fireEvent.click(buttonToHide);

    await screen.findByRole("button", { name: "Display absolute reputation liveliness bar" });
  });
});
