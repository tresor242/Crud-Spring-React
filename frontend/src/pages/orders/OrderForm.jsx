import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box, Paper, Typography, TextField, Button, Stack, Divider, CircularProgress,
  Alert, Chip, MenuItem, IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { createOrder } from "../../api/orderApi";
import { listCustomers } from "../../api/customerApi";
import { listProducts } from "../../api/productApi";

export default function OrderForm() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    customerId: "",
    items: [{ productId: "", quantity: 1 }],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      setGlobalError("");
      try {
        const [cs, ps] = await Promise.all([listCustomers(), listProducts()]);
        setCustomers(cs);
        setProducts(ps);
      } catch (e) {
        setGlobalError(readApiError(e).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const productById = useMemo(() => {
    const m = new Map();
    for (const p of products) m.set(String(p.id), p);
    return m;
  }, [products]);

  function setCustomerId(v) {
    setForm((prev) => ({ ...prev, customerId: v }));
    setFieldErrors((prev) => ({ ...prev, customerId: undefined }));
  }

  function setItem(idx, patch) {
    setForm((prev) => {
      const items = prev.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
      return { ...prev, items };
    });
    // erreurs nested: items[0].productId, items[0].quantity
    setFieldErrors((prev) => ({ ...prev }));
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, { productId: "", quantity: 1 }] }));
  }

  function removeItem(idx) {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  }

  function normalizePayload() {
    return {
      customerId: form.customerId === "" ? null : Number(form.customerId),
      items: (form.items ?? []).map((it) => ({
        productId: it.productId === "" ? null : Number(it.productId),
        quantity: it.quantity === "" ? null : Number(it.quantity),
      })),
    };
  }

  function getItemError(idx, field) {
    return fieldErrors[`items[${idx}].${field}`];
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setGlobalError("");
    setFieldErrors({});

    try {
      const payload = normalizePayload();
      const created = await createOrder(payload);
      navigate(`/orders/${created.id}`);
    } catch (e2) {
      const parsed = readApiError(e2);
      setGlobalError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress size={22} />
          <Typography>Chargement…</Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 980 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Chip color="primary" icon={<ReceiptLongIcon />} label="Create order" />
        <Box sx={{ flex: 1 }} />
        <Button component={RouterLink} to="/orders" variant="outlined" startIcon={<ArrowBackIcon />}>
          Retour
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Créer une commande
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
          Choisis un customer, ajoute des products, puis sauvegarde. Validations via Spring (@Valid).
        </Typography>

        <Divider sx={{ my: 2 }} />

        {globalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {globalError}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              select
              label="Customer"
              value={form.customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              error={Boolean(fieldErrors.customerId)}
              helperText={fieldErrors.customerId || " "}
              fullWidth
            >
              {customers.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.fullName} (#{c.id})
                </MenuItem>
              ))}
            </TextField>

            <Divider />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 800 }}>Items</Typography>
              <Button onClick={addItem} startIcon={<AddIcon />}>
                Add item
              </Button>
            </Stack>

            {form.items.map((it, idx) => {
              const selected = it.productId ? productById.get(String(it.productId)) : null;

              return (
                <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Stack spacing={1.6} direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }}>
                    <TextField
                      select
                      label="Product"
                      value={it.productId}
                      onChange={(e) => setItem(idx, { productId: e.target.value })}
                      fullWidth
                      error={Boolean(getItemError(idx, "productId"))}
                      helperText={getItemError(idx, "productId") || " "}
                    >
                      {products.map((p) => (
                        <MenuItem key={p.id} value={String(p.id)}>
                          {p.name} (#{p.id})
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label="Quantity"
                      type="number"
                      inputProps={{ min: 1, step: 1 }}
                      value={it.quantity}
                      onChange={(e) => setItem(idx, { quantity: e.target.value })}
                      sx={{ width: { sm: 180 } }}
                      error={Boolean(getItemError(idx, "quantity"))}
                      helperText={getItemError(idx, "quantity") || " "}
                    />

                    <Box sx={{ width: { sm: 180 }, opacity: 0.75 }}>
                      <Typography variant="caption">Unit price</Typography>
                      <Typography sx={{ fontWeight: 800 }}>
                        {selected?.price ?? "—"}
                      </Typography>
                    </Box>

                    <IconButton
                      onClick={() => removeItem(idx)}
                      disabled={form.items.length <= 1}
                      color="error"
                      sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              );
            })}

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Button
                type="submit"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
              >
                {saving ? "Enregistrement..." : "Créer"}
              </Button>

              <Button component={RouterLink} to="/orders" variant="outlined" disabled={saving}>
                Annuler
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

function readApiError(e) {
  const status = e?.response?.status;
  const data = e?.response?.data;

  if (!status) return { message: "Erreur réseau (backend pas accessible ?)", fieldErrors: {} };

  let fieldErrors = {};
  if (status === 400 && data) {
    if (data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
      fieldErrors = data.errors;
      return { message: data.message ?? "Validation error", fieldErrors };
    }
    if (Array.isArray(data.errors)) {
      for (const err of data.errors) {
        if (err?.field) fieldErrors[err.field] = err.message ?? "Invalide";
      }
      return { message: data.message ?? "Validation error", fieldErrors };
    }
    if (data.detail) return { message: data.detail, fieldErrors: {} };
    if (data.message) return { message: data.message, fieldErrors: {} };
  }

  return { message: `Erreur ${status}`, fieldErrors: {} };
}