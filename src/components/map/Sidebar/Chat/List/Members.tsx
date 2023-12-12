import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Paper, Typography } from "@mui/material";
import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import NextImage from "next/image";
import { useEffect, useState } from "react";

import TagIcon from "../../../../../../public/tag.svg";

dayjs.extend(relativeTime);
export const Members = () => {
  const [members, setMembers] = useState<any>([]);
  useEffect(() => {
    const members = [
      {
        title: "Phoneix Baker",
        username: "username",
        tag: "1Cademy",
      },
      {
        title: "Phoneix Baker",
        username: "username",
        tag: "1Cademy",
      },
      {
        title: "Phoneix Baker",
        username: "username",
        tag: "1Cademy",
      },
      {
        title: "Phoneix Baker",
        username: "username",
        tag: "1Cademy",
      },
      {
        title: "Phoneix Baker",
        username: "username",
        tag: "1Cademy",
      },
    ];
    [];
    setMembers(members);
  }, []);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "9px" }}>
      <Paper
        onClick={() => {}}
        elevation={3}
        className="CollapsedProposal collection-item"
        sx={{
          display: "flex",
          gap: "15px",
          padding: "12px 16px 10px 16px",
          borderRadius: "8px",
          boxShadow: theme =>
            theme.palette.mode === "light" ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)" : "none",
          background: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
          cursor: "pointer",
          ":hover": {
            background: theme =>
              theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
          },
        }}
      >
        <PersonAddIcon />
        <Typography>Add a member</Typography>
      </Paper>
      {members.map((member: any, idx: number) => (
        <Paper
          onClick={() => {}}
          key={idx}
          elevation={3}
          className="CollapsedProposal collection-item"
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "12px 16px 10px 16px",
            borderRadius: "8px",
            boxShadow: theme =>
              theme.palette.mode === "light"
                ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
                : "none",
            background: theme =>
              theme.palette.mode === "dark" ? theme.palette.common.notebookG700 : theme.palette.common.gray100,
            cursor: "pointer",
            ":hover": {
              background: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG600 : theme.palette.common.gray200,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Box
                sx={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "200px",
                  background: "linear-gradient(to right, #FDC830, #F37335)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {member.title
                  .split(" ")
                  .slice(0, 2)
                  .map((word: string) => word[0])
                  .join(" ")}
              </Box>
              <Box>
                <Box sx={{ width: "350px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: "500",
                      lineHeight: "24px",
                    }}
                  >
                    {member.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: theme =>
                        theme.palette.mode === "dark"
                          ? theme.palette.common.notebookG200
                          : theme.palette.common.gray500,
                    }}
                  >
                    @{member.username}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <NextImage width={"20px"} src={TagIcon} alt="tag icon" />
                    <Box
                      sx={{
                        fontSize: "12px",
                        marginLeft: "5px",
                        color: theme =>
                          theme.palette.mode === "dark"
                            ? theme.palette.common.notebookG200
                            : theme.palette.common.gray500,
                      }}
                    >
                      {member.tag}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};
