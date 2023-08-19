/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { ActionsTracksChange } from "src/client/firestore/actionTracks.firestore";
import { User } from "src/knowledgeTypes";

import { SYNCHRONIZE } from "@/components/map/Liveliness/liveliness.utils";
import { MemoizedRelativeLivelinessBar } from "@/components/map/Liveliness/RelativeLivelinessBar";

jest.mock("firebase/firestore", () => ({ __esModule: true, getFirestore: jest.fn() }));
// jest.mock("../../../../src/components/map/Liveliness/liveliness.utils");
// import { SYNCHRONIZE } from "../../../../src/components/map/Liveliness/liveliness.utils";

jest.mock("src/client/firestore/actionTracks.firestore", () => {
  const originalModule = jest.requireActual<typeof import("src/client/firestore/actionTracks.firestore")>(
    "src/client/firestore/actionTracks.firestore"
  );

  // @ts-ignore
  const a = {
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
      imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
      chooseUname: true,
      fullname: "jj pp",
    },
  } as ActionsTracksChange;

  return {
    __esModule: true,
    ...originalModule,
    getActionTrackSnapshot: (db: any, data: any, callback: (changes: ActionsTracksChange[]) => void) => {
      callback([a]);
      return jest.fn();
    },
  };
});

describe("should render relative liveliness bar", () => {
  it("should relative reputations liveliness bars with the students", async () => {
    const variant = "relativeInteractions";
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
    // debug();
    // expect(screen.getByRole("feed")).toHaveAttribute("aria-label", SYNCHRONIZE[variant].name);
    // const component = screen.getByRole("feed");
    // screen.findByRole("feed");

    // console.log(component);
    expect(screen.getByRole("feed")).toHaveAttribute("aria-label", SYNCHRONIZE[variant].name);
  });
});
