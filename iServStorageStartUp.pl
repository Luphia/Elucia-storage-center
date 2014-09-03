#!/usr/bin/perl
# 2013/11/28
# Josh Tsai
# Ver 1.0.0
#
# 定時監控 Daemons，若發現未執行則啟動 Daemon
#
use IO::Handle;
use FindBin;

# 監控程序名稱
my $proc_name = "node";
my $exec_proc_name = "start.sh";

# 程式執行路徑，由程式自動取得，無須設定
my $exec_path;
&get_exec_path();

#############################################################################
## Main 
#############################################################################

my ($result,$pid) = &check_proc_from_ps_by_name($proc_name);

&get_exec_path();
#my $proc_path = $exec_path."/".$exec_proc_name;
#my $proc_path = "node /home/ubuntu/SUPPLIER/app \"/home/ubuntu/SUPPLIER/logs/$(date +%F).log\" &";
my $proc_path = "sh /home/ubuntu/CENTER/start.sh";

print "********************** result,pid = $result, $pid \n";
print "********************** proc_name,proc_path = $proc_name,$proc_path \n";

if($result != 1 ){		
	# 寫 log
	print "openstack_proc_checker:$proc_name is not running, try to startup $proc_path...\n";
	# 啟動 proc
	&start_proc($proc_path);
}


#############################################################################
## 處理 proc 
#############################################################################

# 從 ps 中檢查 process 是否存在，回傳結果與 pid
sub check_proc_from_ps_by_name()
{

	my ($proc_name) = @_;
	my $result = 0;
	my $return_pid;
	my @msg = qx(/bin/ps aux);

	foreach my $record (@msg)
	{
		if ($record =~ /$proc_name/) 
		{
			$result = 1;
			#print "proc:$record\n";
			my @ps_split = split( /\s+/, $record) ;
			$return_pid = $ps_split[1];		
		}
	}
	print "result:$result\n";
	print "return_pid:$return_pid\n";
	return $result,$return_pid;
}

# 刪除 perl process 
sub kill_proc()
{
	my($pid) = @_;
	# 刪除 process
	my @msg = qx(sudo kill -9 $pid);
	#logMessage(@msg);
}

#############################################################################
## Start proc
#############################################################################
sub start_proc()
{
	my ($proc_path) = @_;
	my $result = 0;
	system("$proc_path");
}

#############################################################################
## Util
#############################################################################

sub getDTime {
    my ($s, $m, $h, $dd, $mm, $yy) = localtime();
    my $mtime = sprintf("%.4d-%.2d-%.2d_%.2d:%.2d:%.2d",
        $yy+1900, $mm+1, $dd, $h, $m, $s);
    return $mtime;
}

sub trim {
    my ($msg) = @_;
    $msg =~ s/\s+$//;
    return $msg;
}

# 取得程式執行路徑
sub get_exec_path
{
	$exec_path = $FindBin::Bin;
	$exec_path =~ s/\s+$//;
}
