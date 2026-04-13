import pandas as pd
import os

print(os.listdir("./data"))

df = pd.read_csv("./data/jobs.csv")
print(df.head())