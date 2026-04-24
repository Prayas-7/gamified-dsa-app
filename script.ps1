```powershell
for ($i = 1; $i -le 45; $i++) {

    $daysAgo = Get-Random -Minimum 1 -Maximum 90
    $date = (Get-Date).AddDays(-$daysAgo)

    Add-Content -Path "README.md" -Value "`nUpdate $i"

    git add .

    $env:GIT_AUTHOR_DATE = $date.ToString("yyyy-MM-dd HH:mm:ss")
    $env:GIT_COMMITTER_DATE = $date.ToString("yyyy-MM-dd HH:mm:ss")

    git commit -m "update project progress $i"
}
```
