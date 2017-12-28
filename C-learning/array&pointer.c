/**
* 数组与指针
*/

// 使用指针遍历数组
#include <stdio.h>

int main()
{
  int arr[8] = { 1, 1, 2, 3, 5, 8, 13, 21 };
  int i;
  int *p;
  // 普通遍历
  for(i = 0; i < 8; i++)
  {
      printf("%d ", arr[i]);
  }
  // 指针遍历
  for(p = &(arr[0]); p <= &(arr[7]); p++)
  {
      printf("%d ", *p);
  }
  // 数组名获取指针地址
  for(p = arr; p < (arr+8); p++)
  {
      printf("%d ", *p);
  }

  // 指针与字符串的一些关系
  printf("%c\n", *("Hello world"+1)); // e
	printf("%d\n", *("Hello world"+1)); // 101
	printf("%d\n", *(str+5)); // 0
}
// 数组名就是一个地址，指向这个数据的开端
// 下标对于数组来说，就是相对于起始地址的一个偏移量