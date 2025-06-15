export enum PlateFormat {
  OLD = 'OLD',  // AAA-1234
  NEW = 'NEW',  // BRA2E19
}

export interface PlateValidationResult {
  isValid: boolean;
  format: PlateFormat | null;
  formatted: string;
  errorMessage?: string;
}

export class BrazilianPlateValidator {
  private static readonly OLD_PLATE_REGEX = /^[A-Z]{3}-?\d{4}$/;
  private static readonly NEW_PLATE_REGEX = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  static detectFormat(input: string): PlateFormat | null {
    const cleanInput = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    if (cleanInput.length === 7) {
      if (this.OLD_PLATE_REGEX.test(`${cleanInput.slice(0, 3)}-${cleanInput.slice(3)}`)) {
        return PlateFormat.OLD;
      }
      
      if (this.NEW_PLATE_REGEX.test(cleanInput)) {
        return PlateFormat.NEW;
      }
    }
    
    if (cleanInput.length <= 3) {
      return null;
    }
    
    if (cleanInput.length === 4 && /^[A-Z]{3}\d$/.test(cleanInput)) {
      return null;
    }
    
    if (cleanInput.length === 5) {
      if (/^[A-Z]{3}\d[A-Z]$/.test(cleanInput)) {
        return PlateFormat.NEW;
      }
      if (/^[A-Z]{3}\d{2}$/.test(cleanInput)) {
        return PlateFormat.OLD;
      }
    }
    
    if (cleanInput.length === 6) {
      if (/^[A-Z]{3}\d[A-Z]\d$/.test(cleanInput)) {
        return PlateFormat.NEW;
      }
      if (/^[A-Z]{3}\d{3}$/.test(cleanInput)) {
        return PlateFormat.OLD;
      }
    }
    
    return null;
  }
  
  static applyMask(input: string, format: PlateFormat | null = null): string {
    const cleanInput = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    if (cleanInput.length === 0) return '';
    
    const detectedFormat = format || this.detectFormat(cleanInput);
    
    if (!detectedFormat) {
      return cleanInput;
    }
    
    switch (detectedFormat) {
      case PlateFormat.OLD:
        if (cleanInput.length <= 3) {
          return cleanInput;
        }
        return `${cleanInput.slice(0, 3)}-${cleanInput.slice(3, 7)}`;
        
      case PlateFormat.NEW:
        return cleanInput;
        
      default:
        return cleanInput;
    }
  }
  
  static validate(input: string): PlateValidationResult {
    const cleanInput = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    if (cleanInput.length === 0) {
      return {
        isValid: false,
        format: null,
        formatted: '',
        errorMessage: 'Placa é obrigatória',
      };
    }
    
    if (cleanInput.length < 7) {
      return {
        isValid: false,
        format: null,
        formatted: this.applyMask(cleanInput),
        errorMessage: 'Placa incompleta',
      };
    }
    
    if (cleanInput.length > 7) {
      return {
        isValid: false,
        format: null,
        formatted: input,
        errorMessage: 'Placa muito longa',
      };
    }
    
    const format = this.detectFormat(cleanInput);
    
    if (!format) {
      return {
        isValid: false,
        format: null,
        formatted: input,
        errorMessage: 'Formato de placa inválido',
      };
    }
    
    const formatted = this.applyMask(cleanInput, format);
    
    switch (format) {
      case PlateFormat.OLD:
        if (!this.OLD_PLATE_REGEX.test(formatted)) {
          return {
            isValid: false,
            format,
            formatted,
            errorMessage: 'Formato inválido. Use: AAA-1234',
          };
        }
        break;
        
      case PlateFormat.NEW:
        if (!this.NEW_PLATE_REGEX.test(cleanInput)) {
          return {
            isValid: false,
            format,
            formatted,
            errorMessage: 'Formato inválido. Use: BRA2E19',
          };
        }
        break;
    }
    
    return {
      isValid: true,
      format,
      formatted,
    };
  }
  
  static formatPlateInput(currentValue: string, newInput: string): string {
    const cleanInput = newInput.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    if (cleanInput.length > 7) {
      return currentValue;
    }
    
    return this.applyMask(cleanInput);
  }
}