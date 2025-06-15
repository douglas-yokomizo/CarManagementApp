import { Car } from './Car';

export type RootStackParamList = {
  CarList: { shouldRefresh?: boolean } | undefined;
  CarDetail: { carId: string };
  CarForm: { car?: Car };
};

export type BottomTabParamList = {
  Home: undefined;
  AddCar: undefined;
};