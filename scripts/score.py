import pandas as pd
df = pd.read_csv("data/cleaned_jobs.csv")
print(df["salary"].describe())
print(df["salary"].quantile([0.25, 0.50, 0.75, 0.90, 0.95]))
