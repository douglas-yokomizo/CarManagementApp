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
            <Ionicons name="close" size={24} color="#333" />
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  clearText: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  optionText: {
    fontSize: 14,
    color: "#666",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  customInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  yearInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    width: 120,
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  applyButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
