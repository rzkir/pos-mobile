import AsyncStorage from "@react-native-async-storage/async-storage";

export class DataExportImportService {
  // Exclude system keys that shouldn't be exported/imported
  private static readonly EXCLUDED_KEYS = ["isLoggedIn"];

  /**
   * Export all data from AsyncStorage to JSON
   */
  static async exportAllData(): Promise<string> {
    try {
      // Get all keys from AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();

      // Filter out excluded keys
      const dataKeys = allKeys.filter(
        (key) => !this.EXCLUDED_KEYS.includes(key)
      );

      // Get all values
      const data = await AsyncStorage.multiGet(dataKeys);

      // Convert to object
      const exportData: Record<string, any> = {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        data: {},
      };

      // Parse each value and add to export object
      data.forEach(([key, value]) => {
        if (value !== null) {
          try {
            // Try to parse as JSON, if fails use as string
            exportData.data[key] = JSON.parse(value);
          } catch {
            exportData.data[key] = value;
          }
        }
      });

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Error exporting data:", error);
      throw new Error("Gagal mengekspor data");
    }
  }

  /**
   * Import data from JSON string to AsyncStorage
   */
  static async importData(jsonString: string): Promise<void> {
    try {
      // Parse JSON
      const importData = JSON.parse(jsonString);

      // Validate structure
      if (!importData.data || typeof importData.data !== "object") {
        throw new Error("Format data tidak valid");
      }

      // Prepare data for AsyncStorage
      const entries: [string, string][] = [];

      Object.entries(importData.data).forEach(([key, value]) => {
        // Skip excluded keys
        if (this.EXCLUDED_KEYS.includes(key)) {
          return;
        }

        // Convert value to string
        if (typeof value === "string") {
          entries.push([key, value]);
        } else {
          entries.push([key, JSON.stringify(value)]);
        }
      });

      // Import all data at once
      if (entries.length > 0) {
        await AsyncStorage.multiSet(entries);
      }
    } catch (error) {
      console.error("Error importing data:", error);
      if (error instanceof SyntaxError) {
        throw new Error("Format JSON tidak valid");
      }
      throw new Error(
        "Gagal mengimpor data: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }

  /**
   * Get count of data items in storage
   */
  static async getDataCount(): Promise<number> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const dataKeys = allKeys.filter(
        (key) => !this.EXCLUDED_KEYS.includes(key)
      );
      return dataKeys.length;
    } catch (error) {
      console.error("Error getting data count:", error);
      return 0;
    }
  }
}
