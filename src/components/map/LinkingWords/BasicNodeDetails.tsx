import LaunchIcon from "@mui/icons-material/Launch";
import { Button, IconButton, Link, Tooltip } from "@mui/material";
import { Box } from "@mui/system";
import React, { ReactNode } from "react";

import LinkingButton from "./LinkingButton";

type BasicNodeDetailsProps = {
  identifier: string;
  openPart: "LinkingWords" | "References" | "Tags";
  parents: any[];
  nodesChildren: any[];
  tags: any[];
  references: any[];
  nodeType: any;
  displayJoinMessage?: () => void;
};

const BasicNodeDetails = (props: BasicNodeDetailsProps) => {
  return (
    <Box id={`${props.identifier}-linking-words`}>
      <Box
        sx={{
          py: "8px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: theme => (theme.palette.mode === "dark" ? "#303134" : "#EAECF0"),
        }}
      >
        <Box className="LearnBefore" sx={{ p: "10px 6px 10px 13px" }}>
          {props.openPart === "LinkingWords" && (
            <Box id={`${props.identifier}-parents-list`} sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <strong>Parents (Prerequisites)</strong>

              {props.parents.map((parent: any, idx: number) => {
                return (
                  <Box
                    id={`${props.identifier}-parent-button-${idx}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      alignItems: "center",
                    }}
                    key={props.identifier + "LinkTo" + parent.node}
                  >
                    <LinkingButton
                      onClick={props.displayJoinMessage}
                      linkedNodeID={parent.node}
                      linkedNodeTitle={parent.title}
                      linkedNodeType="parent"
                      nodeType={parent.type}
                      visible={parent.visible}
                      disabled={true}
                    />
                  </Box>
                );
              })}
              {props.parents.length > 0 && (
                <CustomButton onClickOnDisable={props.displayJoinMessage} disable={true}>
                  Open All Parents
                </CustomButton>
              )}
            </Box>
          )}

          {props.openPart === "References" && props.nodeType !== "Reference" && (
            <Box
              id={`${props.identifier}-node-references`}
              sx={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <strong>References</strong>

              {props.references.map((reference: any, idx: number) => {
                let refTitle = reference.title;
                let urlRefLabel = [false, false];
                if ("label" in reference && reference.label !== "") {
                  const separatedURL = separateURL(reference.title ?? "", reference.label ?? "");
                  if (separatedURL[0]) {
                    urlRefLabel = separatedURL;
                  } else {
                    refTitle += ": " + reference.label;
                  }
                }
                return (
                  <Box
                    key={props.identifier + "LinkTo" + reference.node + "DIV"}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 32px",
                      gridTemplateRows: "auto",
                      alignItems: "center",
                      gap: "1px 4px",
                    }}
                  >
                    <Box sx={{ gridColumn: urlRefLabel[0] ? "1 / 2" : "1 / span 2" }}>
                      <LinkingButton
                        id={`${props.identifier}-reference-button-${idx}`}
                        key={props.identifier + "LinkTo" + reference.node}
                        onClick={props.displayJoinMessage}
                        linkedNodeID={reference.node}
                        linkedNodeTitle={refTitle}
                        linkedNodeType="reference"
                        iClassName="menu_book"
                        disabled={true}
                      />
                    </Box>

                    {urlRefLabel[0] && (
                      <Tooltip
                        title=" Open link in new tab."
                        placement="right"
                        sx={{
                          color: "#bebebe",
                          ":hover": {
                            color: theme => theme.palette.common.orange,
                          },
                        }}
                      >
                        <IconButton>{urlRefLabel[1]}</IconButton>
                      </Tooltip>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
        <Box
          className="LearnAfter"
          sx={{
            borderLeft: theme => (theme.palette.mode === "dark" ? `solid 1px #404040` : "solid 1px #D0D5DD"),
            p: "10px 13px 10px 13px",
          }}
        >
          {props.openPart === "References" && (
            <Box
              id={`${props.identifier}-node-tags`}
              sx={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "16px" }}
            >
              <strong>Tags</strong>
              {props.tags.map((tag: any, idx: number) => {
                return (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    key={props.identifier + "LinkTo" + tag.node + "DIV"}
                  >
                    <LinkingButton
                      id={`${props.identifier}-tag-button-${idx}`}
                      key={props.identifier + "LinkTo" + tag.node}
                      onClick={props.displayJoinMessage}
                      linkedNodeID={tag.node}
                      linkedNodeTitle={tag.title}
                      linkedNodeType="tag"
                      iClassName="local_offer"
                      disabled={true}
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          {props.openPart === "Tags" && (
            <Box id={`${props.identifier}-node-tags`} sx={{ fontSize: "16px" }}>
              <strong>Tags</strong>
              {props.tags.map((tag: any) => {
                return (
                  <div key={props.identifier + "LinkTo" + tag.node + "DIV"}>
                    <LinkingButton
                      key={props.identifier + "LinkTo" + tag.node}
                      onClick={props.displayJoinMessage}
                      linkedNodeID={tag.node}
                      linkedNodeTitle={tag.title}
                      linkedNodeType="tag"
                      iClassName="local_offer"
                      disabled={true}
                    />
                  </div>
                );
              })}
            </Box>
          )}

          {props.openPart === "LinkingWords" && (
            <Box id={`${props.identifier}-children-list`} sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <strong>Children (Follow-ups)</strong>
              {props.nodesChildren.map((child: any, idx: number) => {
                return (
                  <Box
                    id={`${props.identifier}-child-button-${idx}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    key={props.identifier + "LinkTo" + child.node + "DIV"}
                  >
                    <LinkingButton
                      key={props.identifier + "LinkTo" + child.node}
                      onClick={props.displayJoinMessage}
                      linkedNodeID={child.node}
                      linkedNodeTitle={child.title}
                      linkedNodeType="child"
                      nodeType={child.type}
                      visible={child.visible}
                      disabled={true}
                    />
                  </Box>
                );
              })}
              {props.nodesChildren.length > 0 && (
                <CustomButton onClickOnDisable={props.displayJoinMessage} disable={true}>
                  Open All Children
                </CustomButton>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export const MemoizedBasicNodeDetails = React.memo(BasicNodeDetails);

const separateURL = (text: string, url: string): [boolean, any] => {
  // console.log("separateURL", text);
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = url.match(urlRegex);
  if (matches && matches.length > 0) {
    return [
      true,
      <Link
        key={"link"}
        href={matches[0]}
        target="_blank"
        rel="noreferrer"
        sx={{
          display: "grid",
          placeItems: "center",
          color: "#bebebe",
          ":hover": {
            color: theme => theme.palette.common.orange,
          },
        }}
      >
        <LaunchIcon sx={{ fontSize: "16px" }} /> {/* {text} */}
      </Link>,
    ];
  } else {
    return [false, url];
  }
};

type CustomButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  onClickOnDisable?: () => void;
  disable?: boolean;
};

const CustomButton = ({ children, onClick, onClickOnDisable, disable }: CustomButtonProps) => {
  if (disable) {
    return (
      <Box
        onClick={onClickOnDisable}
        sx={{ color: "rgba(255, 255, 255, 0.3)", fontSize: "0.875rem", p: "6px 8px", fontWeight: 500 }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Button
      onClick={onClick}
      sx={{
        justifyContent: "stretch",
        textAlign: "left",
        ":hover": {
          background: "transparent",
        },
      }}
    >
      {children}
    </Button>
  );
};
