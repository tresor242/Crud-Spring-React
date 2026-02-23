import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EditIcon from "@mui/icons-material/Edit";

import { createProduct, getProduct, updateProduct } from "../../api/productApi";

export default function ProductForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: "",
    price: "", 
    stock: "", 
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;

    async function load() {
      setLoading(true);
      setGlobalError("");
      try {
        const data = await getProduct(id);
        setForm({
          name: data.name ?? "",
          price: data.price ?? "",
          stock: data.stock ?? "",
        });
      } catch (e) {
        setGlobalError(readApiError(e).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isEdit, id]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function normalizePayload() {
 
    const price =
      form.price === "" || form.price === null ? null : Number(form.price);
    const stock =
      form.stock === "" || form.stock === null ? null : Number(form.stock);

    return {
      name: form.name,
      price: Number.isFinite(price) ? price : form.price, 
      stock: Number.isFinite(stock) ? stock : form.stock,
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setGlobalError("");
    setFieldErrors({});

    try {
      const payload = normalizePayload();
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/products");
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
          <Typography>Chargement du product…</Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 760 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Chip
          color={isEdit ? "secondary" : "primary"}
          icon={isEdit ? <EditIcon /> : <AddBoxIcon />}
          label={isEdit ? "Edit mode" : "Create mode"}
          variant="filled"
        />
        <Box sx={{ flex: 1 }} />
        <Button
          component={RouterLink}
          to="/products"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Retour
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {isEdit ? `Éditer Product #${id}` : "Créer un Product"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Remplis les infos puis sauvegarde. Les validations viennent de Spring Boot (@Valid).
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {globalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {globalError}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2.2}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Ex: iPhone 15"
              fullWidth
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name || " "}
            />

            <TextField
              label="Price"
              name="price"
              value={form.price}
              onChange={onChange}
              placeholder="Ex: 199.99"
              fullWidth
              inputMode="decimal"
              error={Boolean(fieldErrors.price)}
              helperText={fieldErrors.price || " "}
            />

            <TextField
              label="Stock"
              name="stock"
              value={form.stock}
              onChange={onChange}
              placeholder="Ex: 10"
              fullWidth
              inputMode="numeric"
              error={Boolean(fieldErrors.stock)}
              helperText={fieldErrors.stock || " "}
            />

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Button
                type="submit"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
              >
                {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer"}
              </Button>

              <Button
                component={RouterLink}
                to="/products"
                variant="outlined"
                disabled={saving}
              >
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