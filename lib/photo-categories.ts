export interface PhotoCategoryOption {
  value: string;
  label: string;
}

export const PHOTO_CATEGORIES: PhotoCategoryOption[] = [
  { value: "exterior-front", label: "Exterior Front" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathrooms", label: "Bathrooms" },
  { value: "bedrooms", label: "Bedrooms" },
  { value: "basement-foundation", label: "Basement/Foundation" },
  { value: "roof-repairs", label: "Roof/Repairs" },
  { value: "yard-garage", label: "Yard/Garage" },
  { value: "other", label: "Other" },
];

export const PHOTO_CATEGORY_VALUES = PHOTO_CATEGORIES.map((category) => category.value);

export function isPhotoCategory(value: string): boolean {
  return PHOTO_CATEGORY_VALUES.includes(value);
}
