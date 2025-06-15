import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CarFilters } from "../types/Car";

interface FilterModalProps {
  visible: boolean;
  filters: CarFilters;
  onApplyFilters: (filters: CarFilters) => void;
  onClose: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
const COMMON_BRANDS = [
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "Volkswagen",
  "Hyundai",
  "Nissan",
  "Kia",
  "Renault",
  "Fiat",
];
const COMMON_COLORS = [
  "Branco",
  "Preto",
  "Prata",
  "Cinza",
  "Azul",
  "Vermelho",
  "Verde",
  "Amarelo",
  "Marrom",
  "Bege",
];

export default function FilterModal({
  visible,
  filters,
  onApplyFilters,
  onClose,
}: FilterModalProps) {
  const [tempFilters, setTempFilters] = useState<CarFilters>(filters);

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleClear = () => {
    setTempFilters({});
  };

  const handleBrandSelect = (brand: string) => {
    setTempFilters((prev) => ({
      ...prev,
      marca: prev.marca === brand ? undefined : brand,
    }));
  };

  const handleColorSelect = (color: string) => {
    setTempFilters((prev) => ({
      ...prev,
      cor: prev.cor === color ? undefined : color,
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Filtros</Text>
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Marca</Text>
            <View style={styles.optionsContainer}>
              {COMMON_BRANDS.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  style={[
                    styles.optionButton,
                    tempFilters.marca === brand && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleBrandSelect(brand)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      tempFilters.marca === brand && styles.optionTextSelected,
                    ]}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.customInput}
              placeholder="Ou digite uma marca personalizada"
              placeholderTextColor="#7070a0"
              value={
                tempFilters.marca && !COMMON_BRANDS.includes(tempFilters.marca)
                  ? tempFilters.marca
                  : ""
              }
              onChangeText={(text) =>
                setTempFilters((prev) => ({
                  ...prev,
                  marca: text || undefined,
                }))
              }
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ano</Text>
            <TextInput
              style={styles.yearInput}
              placeholder={`Ex: ${CURRENT_YEAR}`}
              placeholderTextColor="#7070a0"
              value={tempFilters.ano?.toString() || ""}
              onChangeText={(text) => {
                const parsed = text ? parseInt(text, 10) : undefined;
                setTempFilters((prev) => ({
                  ...prev,
                  ano: (parsed && !isNaN(parsed)) ? parsed : undefined,
                }));
              }}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cor</Text>
            <View style={styles.optionsContainer}>
              {COMMON_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.optionButton,
                    tempFilters.cor === color && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleColorSelect(color)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      tempFilters.cor === color && styles.optionTextSelected,
                    ]}
                  >
                    {color}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.customInput}
              placeholder="Ou digite uma cor personalizada"
              placeholderTextColor="#7070a0"
              value={
                tempFilters.cor && !COMMON_COLORS.includes(tempFilters.cor)
                  ? tempFilters.cor
                  : ""
              }
              onChangeText={(text) =>
                setTempFilters((prev) => ({ ...prev, cor: text || undefined }))
              }
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a40",
    paddingTop: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 16,
    color: "#6c63ff",
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#1a1a2e",
    borderWidth: 2,
    borderColor: "#2a2a40",
  },
  optionButtonSelected: {
    backgroundColor: "#6c63ff",
    borderColor: "#6c63ff",
  },
  optionText: {
    fontSize: 14,
    color: "#a0a0b5",
    fontWeight: "600",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  customInput: {
    borderWidth: 2,
    borderColor: "#2a2a40",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    fontWeight: "500",
  },
  yearInput: {
    borderWidth: 2,
    borderColor: "#2a2a40",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: "#1a1a2e",
    color: "#ffffff",
    fontWeight: "500",
    width: 140,
  },
  footer: {
    padding: 24,
    backgroundColor: "#1a1a2e",
    borderTopWidth: 1,
    borderTopColor: "#2a2a40",
  },
  applyButton: {
    backgroundColor: "#6c63ff",
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#6c63ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
