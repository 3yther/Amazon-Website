// The choice values from MODELS.md with English labels. The translated words are in i18n/messages.

export const CONTENT_TYPES = {
  guide: "Guide",
  document: "Document",
  video: "Video",
  prep_pack: "Prep pack",
  class_pack: "Class pack",
};

export const AUDIENCES = {
  all: "Everyone",
  student: "Students",
  parent: "Parents and guardians",
  teacher: "Teachers and schools",
};

// Account types offered at registration. Amazon staff accounts are made in
// Django admin, so that choice is left out.
export const USER_TYPES = {
  student: "Student",
  parent: "Parent or guardian",
  teacher: "Teacher or school",
};

export const PATHWAY_NAMES = ["Digital", "Business", "Media", "Finance", "Engineering"];
