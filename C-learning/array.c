#include <stdio.h>

main()
{
  int a[8] = { 1, 1, 2, 3, 5, 8, 13, 21 };
  int i;

  for (i = 0; i < 8; i++)
  {
    printf("%d ", a[i]);
  }
  mutlArr();
}

mutlArr() {
  int grade[2][3] = { { 80,75,92 },{ 61,65,71 } };
  int i, j;
  for (i = 0; i < 4; i++)
  {
    for (j = 0; j < 3; j++)
    {
      if (grade[i][j] < 60)
      {
        printf(grade[i][j]);
      }
    }
  }
}
