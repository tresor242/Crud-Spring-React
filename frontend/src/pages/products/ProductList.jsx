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

import { deleteProduct, listProducts } from "../../api/productApi";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  async function refresh() {
    setLoading(true);
    setErr("");
    try {
      const data = await listProducts();
      setProducts(data);
    } catch (e) {
      setErr(readApiError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) =>
      (p.name ?? "").toLowerCase().includes(s)
    );
  }, [products, q]);

  async function onDelete(id) {
    if (!confirm("Supprimer ce product ?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(readApiError(e));
    }
  }

  return (
    <Box>
      <Paper sx={{ p: 2.5 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <Box>
            <Typography variant="h6">Products</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Gérer la liste des produits (CRUD)
            </Typography>
          </Box>

          <Box sx={{ ml: "auto", display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
            <TextField
              size="small"
              placeholder="Recherche name…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ width: { xs: "100%", sm: 320 } }}
            />
            <Button onClick={refresh} variant="outlined" disabled={loading}>
              Refresh
            </Button>
            <Button component={Link} to="/products/new" startIcon={<AddIcon />}>
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
              <TableCell sx={{ fontWeight: 800 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 800, width: 180 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5}>Chargement…</TableCell>
              </TableRow>
            )}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Aucun produit.</TableCell>
              </TableRow>
            )}

            {!loading && filtered.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.id}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
                </TableCell>
                <TableCell sx={{ opacity: 0.85 }}>{p.price}</TableCell>
                <TableCell sx={{ opacity: 0.85 }}>{p.stock}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Détails">
                    <IconButton component={Link} to={`/products/${p.id}`}>
                      <OpenInNewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Éditer">
                    <IconButton component={Link} to={`/products/${p.id}/edit`}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton onClick={() => onDelete(p.id)}>
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