package com.model;


import org.ejml.simple.SimpleMatrix;
import java.util.ArrayList;
import java.util.List;

public class Model2D {

    public Block[][] blocks;
    List<Block> unknownBlocks;
    //List<SimpleMatrix> sSequence=new ArrayList<>();
    List<double[][]> sSequence=new ArrayList<>();
    SimpleMatrix constant;
    SimpleMatrix coeffcient;
    SimpleMatrix pressure;
   // SimpleMatrix saturation;
    public double[][] saturation;
    public double[][] pressures;
    SimpleMatrix perms;
    double[][] fieldPerm;
    int nx;
    int ny;
    int dx;
    int dy;
    double dt=800;
    double inPressure;
    double outPressure;
    double avePerm;
    //water
    double v1;
    //oil
    double v2;
    double criticalS1=0;
    double criticalS2=0;
    double resPressure;


    public Model2D(int nx,int ny, int dx,int dy, double pIn, double pOut,double avePerm, double v1, double v2,double resPressure,double[][] perm){
        this.nx=nx;
        this.ny=ny;
        this.inPressure=pIn;
        this.outPressure=pOut;
        this.avePerm=avePerm;
        this.v1=v1;
        this.v2=v2;
        this.dx=dx;
        this.dy=dy;
        this.resPressure=resPressure;
        unknownBlocks=new ArrayList<>();
        coeffcient=new SimpleMatrix((nx-2)*(ny-2),(nx-2)*(ny-2));
        coeffcient.set(0);
        constant=new SimpleMatrix((nx-2)*(ny-2),1);
        constant.set(0);
        pressure=new SimpleMatrix((nx-2)*(ny-2),1);
       // saturation=new SimpleMatrix((nx-2),ny-2);
        //saturation.set(0);
        saturation=new double[nx-2][ny-2];
        fieldPerm=new double[nx-2][ny-2];
        this.fieldPerm=perm;
        //sSequence.add(new SimpleMatrix(saturation));
        sSequence.add(saturation);
        perms=new SimpleMatrix(nx,ny);
        blocks=new Block[nx][ny];

    }

    public Model2D(int nx,int ny, int dx,int dy, double pIn, double pOut,double avePerm, double v1, double v2,double resPressure){
        this.nx=nx;
        this.ny=ny;
        this.inPressure=pIn;
        this.outPressure=pOut;
        this.avePerm=avePerm;
        this.v1=v1;
        this.v2=v2;
        this.dx=dx;
        this.dy=dy;
        this.resPressure=resPressure;
        unknownBlocks=new ArrayList<>();
        coeffcient=new SimpleMatrix((nx-2)*(ny-2),(nx-2)*(ny-2));
        coeffcient.set(0);
        constant=new SimpleMatrix((nx-2)*(ny-2),1);
        constant.set(0);
        pressure=new SimpleMatrix((nx-2)*(ny-2),1);
        // saturation=new SimpleMatrix((nx-2),ny-2);
        //saturation.set(0);
        saturation=new double[nx-2][ny-2];
        pressures=new double[nx-2][ny-2];
        //sSequence.add(new SimpleMatrix(saturation));
        sSequence.add(saturation);
        perms=new SimpleMatrix(nx,ny);
        blocks=new Block[nx][ny];

    }


    public List<double[][]> getsSequence() {
        return sSequence;
    }

    public void build(){


        for (int j=0;j<ny;j++){

            for(int i=0;i<nx;i++) {
                blocks[i][j]=new Block();
                blocks[i][j].dx=dx;
                blocks[i][j].dy=dy;
                blocks[i][j].perm=avePerm;
                perms.set(i,j,blocks[i][j].perm*Math.pow(10,13));
                blocks[i][j].s1=criticalS1;
                //blocks[i][j].s2=1-criticalS1;
                blocks[i][j].pressure=resPressure;
                if (j==0 | j==ny-1 |i==0 | i==nx-1){
                    blocks[i][j].pressure=0;
                    blocks[i][j].bound=true;

                }
                if (i==1 && j==0){
                    blocks[i][j].pressure=inPressure;
                    blocks[i][j].s1=1-criticalS2;
                    //   blocks[i][j].s2=criticalS2;
                    blocks[i][j].well=true;

                }else if (i==nx-2&& j==ny-1){

                    blocks[i][j].pressure=outPressure;
                    blocks[i][j].well=true;
                }
                /*
                     0
                1    []    2
                     3

                 */

            }

        }
        setPerm(fieldPerm);
        updateParameter();
    }

    public double kr1(double s){
        return Math.pow((s-criticalS1)/(1-criticalS1-criticalS2),2);

    }
    public double kr2(double s){
        return Math.pow((1-s-criticalS2)/(1-criticalS1-criticalS2),2);

    }


    public double trans1(Block b, String dir){
        double trans=0;
        switch (dir) {
            case "x-": {
                trans = b.kxMinus * kr1(b.neighbors[0].s1) / v1;
                break;
            }
            case "x+":{
                trans = b.kxPlus * kr1(b.s1) / v1;
                break;

            }
            case "y-":{
                trans = b.kyMinus * kr1(b.neighbors[1].s1) / v1;
                break;

            }
            case "y+":{
                trans = b.kyPlus * kr1(b.s1) / v1;
                break;

            }
        }

        return trans;
    }

    public double trans2(Block b, String dir){
        double trans=0;
        switch (dir) {
            case "x-": {
                trans = b.kxMinus * kr2(b.neighbors[0].s1) / v2;
                break;
            }
            case "x+":{
                trans = b.kxPlus * kr2(b.s1) / v2;
                break;

            }
            case "y-":{
                trans = b.kyMinus * kr2(b.neighbors[1].s1) / v2;
                break;

            }
            case "y+":{
                trans = b.kyPlus * kr2(b.s1) / v2;
                break;

            }
        }
        return trans;
    }

    public double perm(Block b1, Block b2)

    {
        return 2*b1.dx/(b1.dx/b1.perm+b2.dx/b2.perm);
    }

    public void setCoef()

    {
        int xx=nx-2;
        int yy=ny-2;
        //coef matrix
        for (int j=0;j<xx*yy;j++){
            for(int i=0;i<xx*yy;i++){
                Block b=unknownBlocks.get(j);
                if (i==j)
                    coeffcient.set(i,j,-b.tx1Plus-b.tx1Minus-b.tx2Plus-b.tx2Minus-b.ty1Plus-b.ty1Minus-b.ty2Plus-b.ty2Minus);
                if(i==j-xx){
                    coeffcient.set(i,j,b.ty1Minus+b.ty2Minus);
                }
                if(i==j+xx){
                    coeffcient.set(i,j,b.ty1Plus+b.ty2Plus);
                }
                if(i==j-1){
                    coeffcient.set(i,j,b.tx1Minus+b.tx2Minus);
                }

                if(i==j+1){
                    coeffcient.set(i,j,b.tx1Plus+b.tx2Plus);
                }

                if(j==0){
                    constant.set(j,(-b.ty1Minus-b.ty2Minus)*inPressure);
                }
                if(j==xx*yy-1){
                    constant.set(j,(-b.ty1Plus-b.ty2Plus)*outPressure);
                }
            }
        }
    }

    public void solve(){

        //solve p
        setCoef();
        pressure=coeffcient.invert().mult(constant);

        //update p
        updateP();

        //update S s
        updateS();

        //update parameter
        updateParameter();

    }

    public void updateParameter(){

        unknownBlocks.clear();

        for (int j=1;j<ny-1;j++){

            for(int i=1;i<nx-1;i++) {

                //set neighbors

                blocks[i][j].neighbors[0]=blocks[i-1][j];
                blocks[i][j].neighbors[1]=blocks[i][j-1];
                blocks[i][j].neighbors[2]=blocks[i][j+1];
                blocks[i][j].neighbors[3]=blocks[i+1][j];

                // System.out.println("i="+i+"j="+j);
                blocks[i][j].kyMinus=perm(blocks[i][j].neighbors[1],blocks[i][j]);
                blocks[i][j].kyPlus=perm(blocks[i][j].neighbors[2],blocks[i][j]);
                blocks[i][j].kxMinus=perm(blocks[i][j].neighbors[0],blocks[i][j]);
                blocks[i][j].kxPlus=perm(blocks[i][j].neighbors[3],blocks[i][j]);

                blocks[i][j].tx1Minus=trans1(blocks[i][j],"x-");
                blocks[i][j].tx1Plus=trans1(blocks[i][j],"x+");
                blocks[i][j].ty1Minus=trans1(blocks[i][j],"y-");
                blocks[i][j].ty1Plus=trans1(blocks[i][j],"y+");
                blocks[i][j].tx2Minus=trans2(blocks[i][j],"x-");
                blocks[i][j].tx2Plus=trans2(blocks[i][j],"x+");
                blocks[i][j].ty2Minus=trans2(blocks[i][j],"y-");
                blocks[i][j].ty2Plus=trans2(blocks[i][j],"y+");

                if(j==1 && i!=1){
                    blocks[i][j].ty1Minus=0;
                    blocks[i][j].ty2Minus=0;
                }
                if(j==ny-2 && i!=nx-2){
                    blocks[i][j].ty1Plus=0;
                    blocks[i][j].ty2Plus =0;
                }
                if(i==1 ){
                    blocks[i][j].tx1Minus=0;
                    blocks[i][j].tx2Minus=0;
                }
                if(i==nx-2 ){
                    blocks[i][j].tx1Plus=0;
                    blocks[i][j].tx2Plus=0;
                }
                unknownBlocks.add(blocks[i][j]);
            }
        }

    }

    public void updateP(){
        Block b;
        int xx=nx-2;
        pressures=new double[nx-2][ny-2];
        for (int j=1;j<ny-1;j++){

            for(int i=1;i<nx-1;i++) {

                // System.out.println("i="+i+"j="+j);
                b=blocks[i][j];
                b.pressure=pressure.get(i-1+(j-1)*xx);
                pressures[i-1][j-1]=b.pressure;

            }
        }
    }

    public void updateS(){
        Block b;
        saturation=new double[nx-2][ny-2];
        for (int j=1;j<ny-1;j++){

            for(int i=1;i<nx-1;i++) {


                b=blocks[i][j];
                double temp1=b.tx1Plus*(b.neighbors[3].pressure-b.pressure)/b.dx-b.tx1Minus*(b.pressure-b.neighbors[0].pressure)/b.dx;
                double temp2=b.ty1Plus*(b.neighbors[2].pressure-b.pressure)/b.dy-b.ty1Minus*(b.pressure-b.neighbors[1].pressure)/b.dy;

                b.s1=b.s1+dt*(temp1/b.dx+temp2/b.dy);
             //   saturation.set(i-1,j-1,b.s1);

                saturation[i-1][j-1]=b.s1;

            }
        }
        //sSequence.add(new SimpleMatrix(saturation));
        sSequence.add(saturation);
    }

    public void setHetero(int x,int y, int w, int h,double f){
        for (int j=y;j<y+w/dx;j++){
            for (int i=x;i<x+h/dy;i++){
                blocks[i][j].perm=f*avePerm;
            }
        }
    }

    public void setPerm(double[][] perm){
        for (int j=1;j<ny-1;j++){
            for (int i=1;i<nx-1;i++){
                double tempperm=perm[i-1][j-1]*Math.pow(10,-15);
                blocks[i][j].perm=tempperm;
            }
        }
    }





}
