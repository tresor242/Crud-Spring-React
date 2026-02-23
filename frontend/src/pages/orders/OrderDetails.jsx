import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Box, Paper, Typography, Stack, Button, Divider, CircularProgress,
  Alert, Chip, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, MenuItem
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SaveIcon from "@mui/icons-material/Save";

import { getOrder, deleteOrder, updateOrderStatus } from "../../api/orderApi";

const STATUS_OPTIONS = ["CREATED", "PAID", "SHIPPED", "CANCELLED"]; 

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [savingStatus, setSavingStatus] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const data = await getOrder(id);
        setOrder(data);
        setStatus(data.status ?? "");
      } catch (e) {
        setErr(readApiError(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const itemsCount = useMemo(() => (order?.items?.length ?? 0), [order]);

  async function onDelete() {
    if (!confirm("Supprimer cet order ?")) return;
    try {
      await deleteOrder(id);
      navigate("/orders");
    } catch (e) {
      alert(readApiError(e));
    }
  }

  async function onSaveStatus() {
    setSavingStatus(true);
    try {
      const updated = await updateOrderStatus(id, status || null);
      setOrder(updated);
    } catch (e) {
      alert(readApiError(e));
    } finally {
      setSavingStatus(false);
    }
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Chargement des détails…</Typography>
        </Stack>
      </Paper>
    );
  }

  if (err) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>
        <Button component={RouterLink} to="/orders" variant="outlined" startIcon={<ArrowBackIcon />}>
          Retour
        </Button>
      </Paper>
    );
  }

  if (!order) return null;

  return (
    <Box sx={{ maxWidth: 980 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Chip color="primary" label="Order" icon={<ReceiptLongIcon />} />
        <Chip variant="outlined" label={`ID #${order.id}`} />
        <Chip variant="outlined" label={`${itemsCount} item${itemsCount > 1 ? "s" : ""}`} />
        <Box sx={{ flex: 1 }} />
        <Button onClick={onDelete} color="error" startIcon={<DeleteIcon />}>
          Supprimer
        </Button>
        <Button component={RouterLink} to="/orders" variant="outlined" startIcon={<ArrowBackIcon />}>
          Retour
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Détails Order
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
          Customer #{order.customerId} — {order.customerName ?? "—"}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <Chip label={`Status: ${order.status ?? "—"}`} />
          <Typography sx={{ opacity: 0.75 }}>
            Created: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
          </Typography>

          <Box sx={{ flex: 1 }} />

          <TextField
            select
            size="small"
            label="Update status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>

          <Button
            onClick={onSaveStatus}
            disabled={savingStatus}
            startIcon={savingStatus ? <CircularProgress size={18} /> : <SaveIcon />}
          >
            {savingStatus ? "Saving..." : "Save"}
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ fontWeight: 800, mb: 1 }}>Items</Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Unit price</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Qty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!order.items || order.items.length === 0) && (
              <TableRow>
                <TableCell colSpan={3} sx={{ opacity: 0.7 }}>
                  Aucun item.
                </TableCell>
              </TableRow>
            )}

            {order.items?.map((it, idx) => (
              <TableRow key={it.id ?? idx}>
                <TableCell>
                  {it.productName ? `${it.productName} (#${it.productId})` : `#${it.productId ?? "—"}`}
                </TableCell>
                <TableCell sx={{ opacity: 0.85 }}>{it.unitPrice ?? "—"}</TableCell>
                <TableCell sx={{ opacity: 0.85 }}>{it.quantity ?? "—"}</TableCell>
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