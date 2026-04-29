import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

const resources = {
  en: {
    translation: {
      app: { name: "Acadivo" },
      nav: {
        dashboard: "Dashboard",
        schools: "Schools",
        subscriptions: "Subscriptions",
        analytics: "Analytics",
        users: "Users",
        advertisements: "Advertisements",
        announcements: "Announcements",
        teachers: "Teachers",
        students: "Students",
        parents: "Parents",
        classes: "Classes",
        subjects: "Subjects",
        timetable: "Timetable",
        attendance: "Attendance",
        fee: "Fee",
        reports: "Reports",
        messages: "Messages",
        notifications: "Notifications",
        settings: "Settings",
      },
      common: {
        search: "Search",
        filter: "Filter",
        add: "Add",
        edit: "Edit",
        delete: "Delete",
        save: "Save",
        cancel: "Cancel",
        close: "Close",
        confirm: "Confirm",
        submit: "Submit",
        loading: "Loading...",
        noData: "No data available",
        error: "Something went wrong",
        success: "Success",
        active: "Active",
        inactive: "Inactive",
        status: "Status",
        actions: "Actions",
        view: "View",
        export: "Export",
        import: "Import",
        bulkImport: "Bulk Import",
        back: "Back",
        next: "Next",
        previous: "Previous",
        page: "Page",
        of: "of",
        total: "Total",
        showing: "Showing",
        entries: "entries",
        all: "All",
        createdAt: "Created At",
        updatedAt: "Updated At",
      },
      validation: {
        required: "This field is required",
        email: "Please enter a valid email",
        minLength: "Must be at least {{count}} characters",
        maxLength: "Must be at most {{count}} characters",
      },
    },
  },
};

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
