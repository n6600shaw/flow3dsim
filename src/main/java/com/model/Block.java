package com.model;

public class Block {
    double pressure;
    public double perm;
    double dy;
    double dx;
    double s1;
 //   double s2;
    double tx1Plus=0;
    double tx1Minus=0;
    double ty1Plus=0;
    double ty1Minus=0;
    double tx2Plus=0;
    double tx2Minus=0;
    double ty2Plus=0;
    double ty2Minus=0;


    double kxPlus;
    double kxMinus;
    double kyPlus;
    double kyMinus;


    boolean well=false;
    boolean bound=false;


    Block[] neighbors=new Block[4];





}
