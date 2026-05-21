export const STUDENT_TOKEN_KEY = "studentToken";
export const STUDENT_PROFILE_KEY = "studentInfo";

export function getStudentToken() {
  return localStorage.getItem(STUDENT_TOKEN_KEY) || localStorage.getItem("token") || "";
}

export function saveStudentSession(token, user) {
  if (typeof token === "object" && token !== null) {
    user = token.user;
    token = token.token;
  }

  if (token) {
    localStorage.setItem(STUDENT_TOKEN_KEY, token);
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(user));
  }
}

export function getStudentProfile() {
  try {
    return JSON.parse(localStorage.getItem(STUDENT_PROFILE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getStoredStudent() {
  const profile = getStudentProfile();
  return profile.email ? profile : null;
}

export function saveStudentProfile(user) {
  if (user) {
    localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(user));
  }
}

export function clearStudentSession() {
  localStorage.removeItem(STUDENT_TOKEN_KEY);
  localStorage.removeItem(STUDENT_PROFILE_KEY);
  localStorage.removeItem("token");
}

export function profileToRegistrationForm(profile = {}) {
  return {
    name: profile.name || "",
    roll: profile.userId || profile.roll || "",
    email: profile.email || "",
    group: profile.group || "",
    semester: profile.semester || "",
    year: profile.year || "",
    residence: profile.residence || "Hosteller",
  };
}
