export const fontPlugin = [
  "expo-font",
  {
    android: {
      fonts: [
        {
          fontFamily: "PlusJakartaSans",
          fontDefinitions: [
            {
              path: "./assets/fonts/PlusJakartaSans-Regular.ttf",
              weight: 400,
            },
            {
              path: "./assets/fonts/PlusJakartaSans-Medium.ttf",
              weight: 500,
            },
            {
              path: "./assets/fonts/PlusJakartaSans-SemiBold.ttf",
              weight: 600,
            },
            {
              path: "./assets/fonts/PlusJakartaSans-Bold.ttf",
              weight: 700,
            },
            {
              path: "./assets/fonts/PlusJakartaSans-ExtraBold.ttf",
              weight: 800,
            },
            {
              path: "./assets/fonts/PlusJakartaSans-Italic.ttf",
              weight: 400,
              style: "italic",
            },
            {
              path: "./assets/fonts/PlusJakartaSans-MediumItalic.ttf",
              weight: 500,
              style: "italic",
            },
            {
              path: "./assets/fonts/PlusJakartaSans-SemiBoldItalic.ttf",
              weight: 600,
              style: "italic",
            },
            {
              path: "./assets/fonts/PlusJakartaSans-BoldItalic.ttf",
              weight: 700,
              style: "italic",
            },
            {
              path: "./assets/fonts/PlusJakartaSans-ExtraBoldItalic.ttf",
              weight: 800,
              style: "italic",
            },
          ],
        },
      ],
    },
  },
] as const;
