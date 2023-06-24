import pandas as pd

df_all = pd.read_csv('all_data.csv')

# Data by year
df = df_all[df_all['Year'] > 2003]
df = df.groupby(['Year'])['Count'].sum()
df.to_csv("viz_data/cancer_year.csv")

# Data by year and gender
df = df_all[df_all['Year'] > 2003]
df = df.groupby(['Year', 'Gender'])['Count'].sum()
df.to_csv("viz_data/cancer_year_gender.csv")

# Data by age
df = df_all[df_all['Year'] == 2020]
df = df.groupby(['Age'])['Count'].sum()
df.to_csv("viz_data/cancer_age.csv")

# Data by type
df = df_all[df_all['Year'] == 2020]
df = df.groupby(['Name'])['Count'].sum()
df = df.sort_values(ascending=False)
df.to_csv("viz_data/cancer_type.csv")

# Data by gender
df = df_all[df_all['Year'] == 2020]
df = df.groupby(['Gender'])['Count'].sum()
df.to_csv("viz_data/cancer_gender.csv")