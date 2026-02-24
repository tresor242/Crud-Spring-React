import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Chip,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const drawerWidth = 280;

export default function AppLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0,0,0,0.08)",
            bgcolor: "background.paper",
            p: 2,
          },
        }}
      >
        <Box sx={{ px: 1, py: 1.5 }}>
          <Typography variant="h6">Dashboard Admin</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Made by TRESOR ELILA with React, MUI, Axios. {/* <3 */}
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ mt: 2, overflow: "hidden" }}>
          <List sx={{ p: 0 }}>
            {/* Customers */}
            <ListItemButton
              component={NavLink}
              to="/customers"
              sx={{
                textDecoration: "none",
                color: "inherit",
                "&.active": {
                  bgcolor: "rgba(37,99,235,0.10)",
                },
              }}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Customers" secondary="CRUD clients" />
            </ListItemButton>

            {/* Products */}
            <ListItemButton
              component={NavLink}
              to="/products"
              sx={{
                textDecoration: "none",
                color: "inherit",
                "&.active": {
                  bgcolor: "rgba(37,99,235,0.10)",
                },
              }}
            >
              <ListItemIcon>
                <Inventory2Icon />
              </ListItemIcon>
              <ListItemText primary="Products" secondary="CRUD produits" />
            </ListItemButton>

            {/* Orders (disabled) */}
            <ListItemButton
                component={NavLink}
                to="/orders"
                sx={{
                    textDecoration: "none",
                    color: "inherit",
                    "&.active": { bgcolor: "rgba(37,99,235,0.10)" },
                }}
                >
                <ListItemIcon><ReceiptLongIcon /></ListItemIcon>
                <ListItemText primary="Orders" secondary="CRUD orders" />
            </ListItemButton>
          </List>
        </Paper>

        <Box sx={{ mt: "auto", p: 1, opacity: 0.7 }}>
          <Typography variant="caption">v0.1 • Admin UI</Typography>
        </Box>
      </Drawer>

      {/* Content area */}
      <Box sx={{ flex: 1 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "rgba(246,247,251,0.8)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            color: "text.primary",
          }}
        >
          <Toolbar>
            <Typography sx={{ fontWeight: 800 }}>Espace Admin</Typography>
            <Box sx={{ ml: "auto" }} />
            <Chip size="small" color="secondary" label="Pro UI" />
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}