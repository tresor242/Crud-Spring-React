import React from "react";
import { useEffect, useMemo, useState } from "react";
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
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EditIcon from "@mui/icons-material/Edit";

import { createCustomer, getCustomer, updateCustomer } from "../../api/customerApi";

export default function CustomerForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    orderIds: [],
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});


  const orderIdsText = useMemo(() => (form.orderIds ?? []).join(","), [form.orderIds]);

  useEffect(() => {
    if (!isEdit) return;

    async function load() {
      setLoading(true);
      setGlobalError("");
      try {
        const data = await getCustomer(id);
        setForm({
          fullName: data.fullName ?? "",
          email: data.email ?? "",
          orderIds: Array.isArray(data.orderIds) ? data.orderIds : [],
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

  function onChangeOrderIds(e) {
    const raw = e.target.value;

    const ids = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0);

    setForm((prev) => ({ ...prev, orderIds: ids }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setGlobalError("");
    setFieldErrors({});

    try {
      if (isEdit) {
        await updateCustomer(id, form);
      } else {
        await createCustomer(form);
      }
      navigate("/customers");
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
          <Typography>Chargement du customer…</Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box sx={{ maxWidth: 760 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Chip
          color={isEdit ? "secondary" : "primary"}
          icon={isEdit ? <EditIcon /> : <PersonAddAlt1Icon />}
          label={isEdit ? "Edit mode" : "Create mode"}
          variant="filled"
        />
        <Box sx={{ flex: 1 }} />
        <Button
          component={RouterLink}
          to="/customers"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Retour
        </Button>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {isEdit ? `Éditer Customer #${id}` : "Créer un Customer"}
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
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              placeholder="Ex: Jean Dupont"
              fullWidth
              error={Boolean(fieldErrors.fullName)}
              helperText={fieldErrors.fullName || " "}
            />

            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="nom@domaine.com"
              fullWidth
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email || " "}
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
                to="/customers"
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