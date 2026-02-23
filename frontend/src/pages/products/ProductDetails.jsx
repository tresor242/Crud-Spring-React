import { useEffect, useState } from "react";
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
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NumbersIcon from "@mui/icons-material/Numbers";

import { getProduct } from "../../api/productApi";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (e) {
        setErr(readApiError(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

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
          to="/products"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Retour
        </Button>
      </Paper>
    );
  }

  if (!product) return null;

  return (
    <Box sx={{ maxWidth: 860 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Chip color="primary" label="Product" />
        <Chip variant="outlined" label={`ID #${product.id}`} />
        <Box sx={{ flex: 1 }} />

        <Button
          component={RouterLink}
          to={`/products/${product.id}/edit`}
          startIcon={<EditIcon />}
        >
          Éditer
        </Button>

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
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          Détails Product
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mt: 0.5 }}>
          Informations du produit
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <InfoRow
            icon={<Inventory2Icon fontSize="small" />}
            label="Name"
            value={product.name || "—"}
          />

          <InfoRow
            icon={<LocalOfferIcon fontSize="small" />}
            label="Price"
            value={product.price ?? "—"}
          />

          <InfoRow
            icon={<NumbersIcon fontSize="small" />}
            label="Stock"
            value={product.stock ?? "—"}
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
  if (data?.message) return data.message;
  if (data?.detail) return data.detail;

  if (status === 404) return "Product introuvable (404)";
  return `Erreur ${status}`;
}