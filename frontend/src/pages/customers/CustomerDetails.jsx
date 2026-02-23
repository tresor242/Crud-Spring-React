import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import BadgeIcon from "@mui/icons-material/Badge";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { getCustomer } from "../../api/customerApi";

export default function CustomerDetails() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const data = await getCustomer(id);
        setCustomer(data);
      } catch (e) {
        setErr(readApiError(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const ordersLabel = useMemo(() => {
    const ids = customer?.orderIds ?? [];
    if (!Array.isArray(ids) || ids.length === 0) return "Aucun order";
    return `${ids.length} order${ids.length > 1 ? "s" : ""}`;
  }, [customer]);

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
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
        <Button
          component={RouterLink}
          to="/customers"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Retour
        </Button>
      </Paper>
    );
  }

  if (!customer) return null;

  return (
    <Box sx={{ maxWidth: 860 }}>
      {/* Header actions */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Chip color="primary" label="Customer" />
        <Chip variant="outlined" label={`ID #${customer.id}`} />
        <Chip variant="outlined" icon={<ReceiptLongIcon />} label={ordersLabel} />

        <Box sx={{ flex: 1 }} />

        <Button
          component={RouterLink}
          to={`/customers/${customer.id}/edit`}
          startIcon={<EditIcon />}
        >
          Éditer
        </Button>

        <Button
          component={RouterLink}
          to="/customers"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Retour
        </Button>
      </Stack>

      {/* Details card */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Détails Customer
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
          Informations du client et données associées
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <InfoRow
            icon={<BadgeIcon fontSize="small" />}
            label="Full name"
            value={customer.fullName || "—"}
          />

          <InfoRow
            icon={<MailOutlineIcon fontSize="small" />}
            label="Email"
            value={customer.email || "—"}
          />

          <InfoRow
            icon={<ReceiptLongIcon fontSize="small" />}
            label="Order IDs"
            value={
              Array.isArray(customer.orderIds) && customer.orderIds.length > 0
                ? customer.orderIds.join(", ")
                : "(aucun)"
            }
          />
        </Stack>
      </Paper>
    </Box>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(37,99,235,0.10)",
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 0.3 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
      </Box>
    </Paper>
  );
}

function readApiError(e) {
  const status = e?.response?.status;
  const data = e?.response?.data;

  if (!status) return "Erreur réseau (backend pas accessible ?)";

  // Si ton backend renvoie {message} ou {detail}
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;

  if (status === 404) return "Customer introuvable (404)";
  return `Erreur ${status}`;
}