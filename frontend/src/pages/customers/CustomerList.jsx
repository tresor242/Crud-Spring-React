import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box, Paper, Typography, TextField, Button, Table, TableHead, TableRow,
  TableCell, TableBody, Stack, IconButton, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { deleteCustomer, listCustomers } from "../../api/customerApi";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const data = await listCustomers();
      setCustomers(data);
    } catch (e) {
      setErr(readApiError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((c) =>
      (c.fullName ?? "").toLowerCase().includes(s) ||
      (c.email ?? "").toLowerCase().includes(s)
    );
  }, [customers, q]);

  async function onDelete(id) {
    if (!confirm("Supprimer ce customer ?")) return;
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert(readApiError(e));
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 2.5 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <Box>
            <Typography variant="h6">Client</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Gérer la liste des clients (CRUD)
            </Typography>
          </Box>

          <Box sx={{ ml: "auto", display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
            <TextField
              size="small"
              placeholder="Recherche nom / email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ width: { xs: "100%", sm: 320 } }}
            />
            <Button onClick={refresh} variant="outlined" disabled={loading}>
              Refresh
            </Button>
            <Button component={Link} to="/customers/new" startIcon={<AddIcon />}>
              New
            </Button>
          </Box>
        </Stack>

        {err && <Typography sx={{ mt: 2, color: "error.main" }}>{err}</Typography>}
      </Paper>

      <Paper sx={{ mt: 2, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Full name</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 800, width: 180 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4}>Chargement…</TableCell>
              </TableRow>
            )}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>Aucun client.</TableCell>
              </TableRow>
            )}

            {!loading && filtered.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell>{c.id}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 700 }}>{c.fullName}</Typography>
                </TableCell>
                <TableCell sx={{ opacity: 0.85 }}>{c.email}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Détails">
                    <IconButton component={Link} to={`/customers/${c.id}`}>
                      <OpenInNewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Éditer">
                    <IconButton component={Link} to={`/customers/${c.id}/edit`}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton onClick={() => onDelete(c.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

function readApiError(e) {
  const status = e?.response?.status;
  if (!status) return "Erreur réseau (backend pas accessible ?)";
  const data = e?.response?.data;
  return data?.message || data?.detail || `Erreur ${status}`;
}