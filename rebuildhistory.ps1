$start = Get-Date "2026-01-01"
$end   = Get-Date "2026-04-30"

$current = $start

while ($current -lt $end) {

    $commitsThisWeek = Get-Random -Minimum 2 -Maximum 4

    for ($i = 0; $i -lt $commitsThisWeek; $i++) {

        $daysOffset = Get-Random -Minimum 0 -Maximum 6
        $commitDate = $current.AddDays($daysOffset)

        # FORCE a real change every commit
        Add-Content -Path "README.md" -Value "progress marker $i $commitDate"

        git add README.md

        $env:GIT_AUTHOR_DATE = $commitDate.ToString("yyyy-MM-dd HH:mm:ss")
        $env:GIT_COMMITTER_DATE = $commitDate.ToString("yyyy-MM-dd HH:mm:ss")

        git commit -m "progress update"
    }

    $current = $current.AddDays(7)
}
