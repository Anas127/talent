import pandas as pd
import os

# =========================
# 1. LOAD DATASET
# =========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_path = os.path.join(BASE_DIR, "data", "jobs.csv")

df = pd.read_csv(data_path)

print("Original shape:", df.shape)


# =========================
# 2. KEEP ONLY USEFUL COLUMNS
# =========================

df = df[[
    "job_title",
    "experience_level",
    "salary_in_usd",
    "company_location"
]]

print("After selecting columns:", df.shape)


# =========================
# 3. REMOVE MISSING VALUES
# =========================

df = df.dropna()

print("After removing nulls:", df.shape)


# =========================
# 4. FILTER ONLY DATA JOBS
# =========================

def is_data_job(title):
    keywords = ["Data", "ML", "Machine Learning", "Analytics"]
    return any(keyword.lower() in title.lower() for keyword in keywords)

df = df[df["job_title"].apply(is_data_job)]

print("After filtering roles:", df.shape)


# =========================
# 5. REMOVE OUTLIERS (SALARY)
# =========================

# Remove very low and very high salaries
df = df[(df["salary_in_usd"] > 10000) & (df["salary_in_usd"] < 300000)]

print("After removing outliers:", df.shape)


# =========================
# 6. SAVE CLEANED DATASET
# =========================

output_path = os.path.join(BASE_DIR, "data", "cleaned_jobs.csv")
df.to_csv(output_path, index=False)

print("Cleaned dataset saved at:", output_path)