/*
初识指针
*1) “&” 和 “*”
&: 对变量进行取地址运算: &(变量名) => 获取变量的地址
*: 指针运算符，称它为取值运算：*(变量名) => 将变量当做地址,到相应的地址取值
取地址与取值运算符 ==> 互为逆运算

2)指针变量是什么?
指针变量就是用来存储地址的变量
如,&i 就是一个指向变量i 的指针
通过*(指针)取值

3)指针的作用
引用类型，传递地址，减少内存消耗
*/
#include <stdio.h>

void swap(int *x, int *y)
{
  int temp;
  temp = *x;
  *x = *y;
  *y = temp;
  printf("x=%d, y=%d n", *x, *y);
}

main()
{
  int i = 13, j = 45;
  swap(&i, &j);
  printf("i=%d, j=%dn", i, j);
}
